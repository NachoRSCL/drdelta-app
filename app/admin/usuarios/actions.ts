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

export async function invitarUsuario(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rol = String(formData.get("rol") ?? "ejecutivo");
  if (!email) return { error: "Email vacío" };
  if (rol !== "admin" && rol !== "ejecutivo") return { error: "Rol inválido" };

  const { error: insErr } = await supabase
    .from("invitaciones")
    .upsert({ email, rol, activo: true }, { onConflict: "email" });
  if (insErr) return { error: insErr.message };

  // también sincronizar perfil si ya existe (por si cambiamos rol)
  await supabase
    .from("profiles")
    .update({ rol, activo: true })
    .eq("email", email);

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function cambiarEstadoUsuario(email: string, activo: boolean) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { error: e1 } = await supabase
    .from("invitaciones")
    .update({ activo })
    .eq("email", email);
  if (e1) return { error: e1.message };

  const { error: e2 } = await supabase
    .from("profiles")
    .update({ activo })
    .eq("email", email);
  if (e2) return { error: e2.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function cambiarRolUsuario(email: string, rol: "admin" | "ejecutivo") {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { error: e1 } = await supabase
    .from("invitaciones")
    .update({ rol })
    .eq("email", email);
  if (e1) return { error: e1.message };

  const { error: e2 } = await supabase
    .from("profiles")
    .update({ rol })
    .eq("email", email);
  if (e2) return { error: e2.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
