"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function eliminarRegistro(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("registros")
    .update({ estado: "eliminado", eliminado_en: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/ejecutivo/mis-registros");
  return { ok: true };
}
