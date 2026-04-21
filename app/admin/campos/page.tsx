import { createClient } from "@/lib/supabase/server";
import { crearCampo } from "./actions";
import CampoRow from "./campo-row";

export default async function CamposAdminPage() {
  const supabase = await createClient();
  const { data: campos } = await supabase
    .from("campos")
    .select("id, nombre, comuna, activo")
    .order("nombre");

  return (
    <section className="space-y-6">
      <div>
        <p className="label-up">Admin · Campos</p>
        <h1 className="text-2xl font-bold">Campos / lecherías</h1>
        <p className="text-sm text-slate-500 mt-1">
          Estos son los campos disponibles para los ejecutivos al registrar. Desactiva un campo para dejar de mostrarlo sin perder su historial.
        </p>
      </div>

      <form action={crearCampo} className="frame p-4 flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <label className="label-up">Nombre</label>
          <input name="nombre" required placeholder="Fundo Los Aromos" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="label-up">Comuna (opcional)</label>
          <input name="comuna" placeholder="Osorno" className="w-full border rounded px-3 py-2" />
        </div>
        <button className="btn-primary">Crear campo</button>
      </form>

      <div className="frame overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500 uppercase">
            <tr className="border-b">
              <th className="py-2 px-3">Nombre</th>
              <th className="py-2 px-3">Comuna</th>
              <th className="py-2 px-3">Estado</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {(campos ?? []).map((c) => (
              <CampoRow key={c.id} {...c} />
            ))}
            {(!campos || campos.length === 0) && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  No hay campos creados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
