"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!me || !me.activo || me.rol !== "admin") {
    throw new Error("No autorizado");
  }

  return supabase;
}

export async function invitarUsuario(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rol = String(formData.get("rol") ?? "ejecutivo");

  if (!email) {
    throw new Error("Email vacío");
  }

  if (rol !== "admin" && rol !== "ejecutivo") {
    throw new Error("Rol inválido");
  }

  const { error: insErr } = await supabase
    .from("invitaciones")
    .upsert({ email, rol, activo: true }, { onConflict: "email" });

  if (insErr) {
    throw new Error(insErr.message);
  }

  const { error: syncErr } = await supabase
    .from("profiles")
    .update({ rol, activo: true })
    .eq("email", email);

  if (syncErr) {
    throw new Error(syncErr.message);
  }

  revalidatePath("/admin/usuarios");
}

export async function cambiarEstadoUsuario(
  email: string,
  activo: boolean
): Promise<void> {
  const supabase = await requireAdmin();

  const { error: e1 } = await supabase
    .from("invitaciones")
    .update({ activo })
    .eq("email", email);

  if (e1) {
    throw new Error(e1.message);
  }

  const { error: e2 } = await supabase
    .from("profiles")
    .update({ activo })
    .eq("email", email);

  if (e2) {
    throw new Error(e2.message);
  }

  revalidatePath("/admin/usuarios");
}

export async function cambiarRolUsuario(
  email: string,
  rol: "admin" | "ejecutivo"
): Promise<void> {
  const supabase = await requireAdmin();

  if (rol !== "admin" && rol !== "ejecutivo") {
    throw new Error("Rol inválido");
  }

  const { error: e1 } = await supabase
    .from("invitaciones")
    .update({ rol })
    .eq("email", email);

  if (e1) {
    throw new Error(e1.message);
  }

  const { error: e2 } = await supabase
    .from("profiles")
    .update({ rol })
    .eq("email", email);

  if (e2) {
    throw new Error(e2.message);
  }

  revalidatePath("/admin/usuarios");
}