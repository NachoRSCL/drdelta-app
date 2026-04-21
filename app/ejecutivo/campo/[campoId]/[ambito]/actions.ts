"use server";
import { createClient } from "@/lib/supabase/server";
import { evaluarColor } from "@/lib/semaforo";
import { redirect } from "next/navigation";

type Input = {
  campoId: string;
  ambito: string;
  valores: { variable_id: string; valor: number }[];
};

export async function guardarRegistro(input: Input) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // traer reglas de las variables involucradas
  const ids = input.valores.map((v) => v.variable_id);
  const { data: vars, error: varsErr } = await supabase
    .from("variables")
    .select("id, direccion, corte_rojo, corte_verde, ambito")
    .in("id", ids);
  if (varsErr || !vars) return { error: varsErr?.message ?? "Error cargando variables" };

  // crear cabecera
  const { data: reg, error: regErr } = await supabase
    .from("registros")
    .insert({
      campo_id: input.campoId,
      ambito: input.ambito,
      ejecutivo_id: user.id
    })
    .select("id")
    .single();
  if (regErr || !reg) return { error: regErr?.message ?? "No se pudo crear el registro" };

  // valores + color calculado
  const rows = input.valores.map((v) => {
    const cfg = vars.find((x) => x.id === v.variable_id)!;
    const color = evaluarColor(v.valor, cfg.direccion as "normal" | "invertida", cfg.corte_rojo, cfg.corte_verde);
    return { registro_id: reg.id, variable_id: v.variable_id, valor: v.valor, color };
  });
  const { error: valErr } = await supabase.from("registro_valores").insert(rows);
  if (valErr) return { error: valErr.message };

  redirect(`/ejecutivo/registro/${reg.id}`);
}
