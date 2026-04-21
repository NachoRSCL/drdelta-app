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

export async function crearCampo(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const comuna = String(formData.get("comuna") ?? "").trim() || null;

  if (!nombre) {
    throw new Error("Nombre vacío");
  }

  const { error } = await supabase
    .from("campos")
    .insert({ nombre, comuna, activo: true });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/campos");
}

export async function editarCampo(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const comuna = String(formData.get("comuna") ?? "").trim() || null;

  if (!id || !nombre) {
    throw new Error("Datos incompletos");
  }

  const { error } = await supabase
    .from("campos")
    .update({ nombre, comuna })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/campos");
}

export async function toggleCampoActivo(
  id: string,
  activo: boolean
): Promise<void> {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("campos")
    .update({ activo })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/campos");
}