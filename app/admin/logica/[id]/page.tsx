import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guardarVariable } from "../actions";

export default async function EditarVariablePage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: variable }, { data: textos }, { data: ambitos }] = await Promise.all([
    supabase
      .from("variables")
      .select("id, nombre, ambito, unidad, direccion, corte_rojo, corte_verde, activa")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("variable_textos")
      .select("color, interpretacion, accion, solucion_addvise")
      .eq("variable_id", id),
    supabase.from("ambitos").select("codigo, nombre, orden").order("orden"),
  ]);

  if (!variable) notFound();

  const texto = (color: "rojo" | "amarillo" | "verde") =>
    (textos ?? []).find((t: any) => t.color === color) ?? { interpretacion: "", accion: "", solucion_addvise: "" };

  return (
    <section className="space-y-6">
      <Link href="/admin/logica" className="text-xs text-slate-500 hover:underline">← Lógica</Link>
      <div>
        <p className="label-up">Editar variable</p>
        <h1 className="text-2xl font-bold">{variable.nombre}</h1>
      </div>

      <form action={guardarVariable} className="space-y-6">
        <input type="hidden" name="id" value={variable.id} />

        <div className="frame p-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <label className="label-up">Nombre</label>
            <input name="nombre" defaultValue={variable.nombre} required className="w-full border rounded px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-up">Ámbito</label>
            <select name="ambito" defaultValue={variable.ambito} required className="w-full border rounded px-3 py-2 bg-white">
              {(ambitos ?? []).map((a: any) => (
                <option key={a.codigo} value={a.codigo}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-up">Unidad</label>
            <input name="unidad" defaultValue={variable.unidad ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="label-up">Dirección</label>
            <select name="direccion" defaultValue={variable.direccion} className="w-full border rounded px-3 py-2 bg-white">
              <option value="normal">Normal (↑ mejor)</option>
              <option value="invertida">Invertida (↓ mejor)</option>
            </select>
          </div>
          <div>
            <label className="label-up">Corte rojo</label>
            <input name="corte_rojo" type="number" step="any" defaultValue={variable.corte_rojo} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="label-up">Corte verde</label>
            <input name="corte_verde" type="number" step="any" defaultValue={variable.corte_verde} required className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(["rojo", "amarillo", "verde"] as const).map((color) => {
            const t = texto(color);
            const border =
              color === "rojo" ? "border-red-300 bg-red-50/40" :
              color === "amarillo" ? "border-amber-300 bg-amber-50/40" :
              "border-emerald-300 bg-emerald-50/40";
            const label = color === "rojo" ? "🔴 Rojo" : color === "amarillo" ? "🟡 Amarillo" : "🟢 Verde";
            return (
              <div key={color} className={`frame p-4 border ${border}`}>
                <div className="font-semibold mb-2">{label}</div>
                <label className="label-up">Interpretación</label>
                <textarea
                  name={`${color}_interpretacion`}
                  defaultValue={t.interpretacion ?? ""}
                  rows={3}
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <label className="label-up">Acción</label>
                <textarea
                  name={`${color}_accion`}
                  defaultValue={t.accion ?? ""}
                  rows={3}
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <label className="label-up">Solución Addvise</label>
                <input
                  name={`${color}_solucion`}
                  defaultValue={t.solucion_addvise ?? ""}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button className="btn-primary">Guardar</button>
          <Link href="/admin/logica" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </section>
  );
}
