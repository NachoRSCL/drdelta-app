import { createClient } from "@/lib/supabase/server";
import { crearVariable } from "./actions";
import VariableRow from "./variable-row";

export default async function LogicaPage() {
  const supabase = await createClient();

  const [{ data: variables }, { data: ambitos }] = await Promise.all([
    supabase
      .from("variables")
      .select("id, nombre, ambito, unidad, direccion, corte_rojo, corte_verde, activa")
      .order("ambito")
      .order("nombre"),
    supabase.from("ambitos").select("codigo, nombre, orden").order("orden"),
  ]);

  const nombreAmbito = (c: string) => ambitos?.find((a) => a.codigo === c)?.nombre ?? c;

  return (
    <section className="space-y-6">
      <div>
        <p className="label-up">Admin · Lógica</p>
        <h1 className="text-2xl font-bold">Variables y cortes del semáforo</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cada variable pertenece a un ámbito, tiene dos cortes (rojo / verde) y una dirección. El ejecutivo carga valores y la app calcula el color.
        </p>
      </div>

      <details className="frame p-4">
        <summary className="cursor-pointer font-semibold text-sm">+ Nueva variable</summary>
        <form action={crearVariable} className="mt-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <label className="label-up">Nombre</label>
            <input name="nombre" required placeholder="BHB" className="w-full border rounded px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-up">Ámbito</label>
            <select name="ambito" required className="w-full border rounded px-3 py-2 bg-white">
              <option value="">—</option>
              {(ambitos ?? []).map((a: any) => (
                <option key={a.codigo} value={a.codigo}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-up">Unidad</label>
            <input name="unidad" placeholder="mmol/L" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="label-up">Dirección</label>
            <select name="direccion" defaultValue="normal" className="w-full border rounded px-3 py-2 bg-white">
              <option value="normal">Normal (↑ mejor)</option>
              <option value="invertida">Invertida (↓ mejor)</option>
            </select>
          </div>
          <div>
            <label className="label-up">Corte rojo</label>
            <input name="corte_rojo" type="number" step="any" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="label-up">Corte verde</label>
            <input name="corte_verde" type="number" step="any" required className="w-full border rounded px-3 py-2" />
          </div>
          <div className="sm:col-span-6">
            <button className="btn-primary">Crear y editar textos</button>
          </div>
        </form>
        <p className="text-xs text-slate-500 mt-3">
          Tip: en <b>Normal</b>, rojo = valor &lt; corte_rojo · verde = valor &gt; corte_verde. En <b>Invertida</b> se invierte (menor valor = mejor).
        </p>
      </details>

      <div className="frame overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500 uppercase">
            <tr className="border-b">
              <th className="py-2 px-3">Ámbito</th>
              <th className="py-2 px-3">Variable</th>
              <th className="py-2 px-3">Unidad</th>
              <th className="py-2 px-3">Dirección</th>
              <th className="py-2 px-3">Rojo</th>
              <th className="py-2 px-3">Verde</th>
              <th className="py-2 px-3">Estado</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {(variables ?? []).map((v: any) => (
              <VariableRow
                key={v.id}
                id={v.id}
                nombre={v.nombre}
                ambito={v.ambito}
                ambitoNombre={nombreAmbito(v.ambito)}
                unidad={v.unidad}
                direccion={v.direccion}
                corte_rojo={v.corte_rojo}
                corte_verde={v.corte_verde}
                activa={v.activa}
              />
            ))}
            {(!variables || variables.length === 0) && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  No hay variables creadas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
