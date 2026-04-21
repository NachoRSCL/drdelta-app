"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function crearCampo(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const nombre = String(formData.get("nombre") ?? "").trim();
  const comuna = String(formData.get("comuna") ?? "").trim() || null;
  if (!nombre) return { error: "Nombre vacío" };

  const { error: insErr } = await supabase.from("campos").insert({ nombre, comuna, activo: true });
  if (insErr) return { error: insErr.message };
  revalidatePath("/admin/campos");
  return { ok: true };
}

export async function editarCampo(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const comuna = String(formData.get("comuna") ?? "").trim() || null;
  if (!id || !nombre) return { error: "Datos incompletos" };

  const { error: upErr } = await supabase
    .from("campos")
    .update({ nombre, comuna })
    .eq("id", id);
  if (upErr) return { error: upErr.message };
  revalidatePath("/admin/campos");
  return { ok: true };
}

export async function toggleCampoActivo(id: string, activo: boolean) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const { error: upErr } = await supabase.from("campos").update({ activo }).eq("id", id);
  if (upErr) return { error: upErr.message };
  revalidatePath("/admin/campos");
  return { ok: true };
}
