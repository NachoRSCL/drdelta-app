"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", supabase: null as any };
  const { data: me } = await supabase
    .from("profiles")
    .select("rol, activo")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || !me.activo || me.rol !== "admin") {
    return { error: "No autorizado", supabase: null as any };
  }
  return { error: null, supabase };
}

export async function crearVariable(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const ambito = String(formData.get("ambito") ?? "").trim();
  const unidad = String(formData.get("unidad") ?? "").trim() || null;
  const direccion = String(formData.get("direccion") ?? "normal");
  const corte_rojo = Number(formData.get("corte_rojo"));
  const corte_verde = Number(formData.get("corte_verde"));

  if (!nombre || !ambito) return { error: "Nombre y ámbito obligatorios" };
  if (!Number.isFinite(corte_rojo) || !Number.isFinite(corte_verde)) return { error: "Cortes inválidos" };
  if (direccion !== "normal" && direccion !== "invertida") return { error: "Dirección inválida" };

  const { data: nueva, error: insErr } = await supabase
    .from("variables")
    .insert({ nombre, ambito, unidad, direccion, corte_rojo, corte_verde, activa: true })
    .select("id")
    .single();
  if (insErr || !nueva) return { error: insErr?.message ?? "No se pudo crear" };

  // pre-crear filas vacías de textos para las 3 colores
  await supabase.from("variable_textos").insert([
    { variable_id: nueva.id, color: "rojo", interpretacion: "", accion: "", solucion_addvise: "" },
    { variable_id: nueva.id, color: "amarillo", interpretacion: "", accion: "", solucion_addvise: "" },
    { variable_id: nueva.id, color: "verde", interpretacion: "", accion: "", solucion_addvise: "" },
  ]);

  revalidatePath("/admin/logica");
  redirect(`/admin/logica/${nueva.id}`);
}

export async function guardarVariable(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const ambito = String(formData.get("ambito") ?? "").trim();
  const unidad = String(formData.get("unidad") ?? "").trim() || null;
  const direccion = String(formData.get("direccion") ?? "normal");
  const corte_rojo = Number(formData.get("corte_rojo"));
  const corte_verde = Number(formData.get("corte_verde"));

  if (!id || !nombre || !ambito) return { error: "Datos incompletos" };
  if (!Number.isFinite(corte_rojo) || !Number.isFinite(corte_verde)) return { error: "Cortes inválidos" };

  const { error: upErr } = await supabase
    .from("variables")
    .update({ nombre, ambito, unidad, direccion, corte_rojo, corte_verde })
    .eq("id", id);
  if (upErr) return { error: upErr.message };

  // guardar textos por color
  for (const color of ["rojo", "amarillo", "verde"] as const) {
    const interpretacion = String(formData.get(`${color}_interpretacion`) ?? "");
    const accion = String(formData.get(`${color}_accion`) ?? "");
    const solucion_addvise = String(formData.get(`${color}_solucion`) ?? "");
    const { error: tErr } = await supabase
      .from("variable_textos")
      .upsert(
        { variable_id: id, color, interpretacion, accion, solucion_addvise },
        { onConflict: "variable_id,color" }
      );
    if (tErr) return { error: tErr.message };
  }

  revalidatePath("/admin/logica");
  revalidatePath(`/admin/logica/${id}`);
  return { ok: true };
}

export async function toggleVariableActiva(id: string, activa: boolean) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const { error: upErr } = await supabase.from("variables").update({ activa }).eq("id", id);
  if (upErr) return { error: upErr.message };
  revalidatePath("/admin/logica");
  return { ok: true };
}
