import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SemaforoDot from "@/components/SemaforoDot";

type SearchParams = Promise<{
  ambito?: string;
  campo?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}>;

export default async function RegistrosAdminPage({
  searchParams,
}: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: ambitos }, { data: campos }] = await Promise.all([
    supabase.from("ambitos").select("codigo, nombre, orden").order("orden"),
    supabase.from("campos").select("id, nombre").order("nombre"),
  ]);

  let q = supabase
    .from("registros")
    .select("id, fecha, ambito, estado, campos(nombre), profiles(email)")
    .order("fecha", { ascending: false })
    .limit(200);

  if (sp.ambito) q = q.eq("ambito", sp.ambito);
  if (sp.campo) q = q.eq("campo_id", sp.campo);
  if (sp.estado === "vigente" || sp.estado === "eliminado") q = q.eq("estado", sp.estado);
  if (sp.desde) q = q.gte("fecha", sp.desde);
  if (sp.hasta) q = q.lte("fecha", `${sp.hasta}T23:59:59`);

  const { data: regs } = await q;

  const ids = (regs ?? []).map((r) => r.id);
  const { data: rv } = ids.length
    ? await supabase.from("registro_valores").select("registro_id, color").in("registro_id", ids)
    : { data: [] };

  const cuenta = new Map<string, { rojo: number; amarillo: number; verde: number; total: number }>();
  (rv ?? []).forEach((x: any) => {
    const c = cuenta.get(x.registro_id) ?? { rojo: 0, amarillo: 0, verde: 0, total: 0 };
    c.total += 1;
    if (x.color === "rojo") c.rojo += 1;
    else if (x.color === "amarillo") c.amarillo += 1;
    else if (x.color === "verde") c.verde += 1;
    cuenta.set(x.registro_id, c);
  });

  const nomAmbito = (c: string) => ambitos?.find((a) => a.codigo === c)?.nombre ?? c;

  return (
    <section className="space-y-6">
      <div>
        <p className="label-up">Admin · Registros</p>
        <h1 className="text-2xl font-bold">Historial global</h1>
        <p className="text-sm text-slate-500 mt-1">
          Todos los registros cargados por los ejecutivos. Los eliminados se muestran en cursiva y no entran a informes.
        </p>
      </div>

      <form method="get" className="frame p-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div>
          <label className="label-up">Ámbito</label>
          <select name="ambito" defaultValue={sp.ambito ?? ""} className="w-full border rounded px-3 py-2 bg-white">
            <option value="">Todos</option>
            {(ambitos ?? []).map((a: any) => (
              <option key={a.codigo} value={a.codigo}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-up">Campo</label>
          <select name="campo" defaultValue={sp.campo ?? ""} className="w-full border rounded px-3 py-2 bg-white">
            <option value="">Todos</option>
            {(campos ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-up">Estado</label>
          <select name="estado" defaultValue={sp.estado ?? ""} className="w-full border rounded px-3 py-2 bg-white">
            <option value="">Todos</option>
            <option value="vigente">Vigentes</option>
            <option value="eliminado">Eliminados</option>
          </select>
        </div>
        <div>
          <label className="label-up">Desde</label>
          <input type="date" name="desde" defaultValue={sp.desde ?? ""} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="label-up">Hasta</label>
          <input type="date" name="hasta" defaultValue={sp.hasta ?? ""} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="sm:col-span-5 flex gap-2">
          <button className="btn-primary text-sm">Filtrar</button>
          <Link href="/admin/registros" className="btn-ghost text-sm">Limpiar</Link>
        </div>
      </form>

      <div className="frame overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500 uppercase">
            <tr className="border-b">
              <th className="py-2 px-3">Fecha</th>
              <th className="py-2 px-3">Campo</th>
              <th className="py-2 px-3">Ámbito</th>
              <th className="py-2 px-3">Ejecutivo</th>
              <th className="py-2 px-3">Semáforos</th>
              <th className="py-2 px-3">Estado</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {(regs ?? []).map((r: any) => {
              const cc = cuenta.get(r.id) ?? { rojo: 0, amarillo: 0, verde: 0, total: 0 };
              return (
                <tr key={r.id} className={`border-b ${r.estado === "eliminado" ? "text-slate-400 italic" : ""}`}>
                  <td className="py-2 px-3">
                    {new Date(r.fecha).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="py-2 px-3">{r.campos?.nombre ?? "—"}</td>
                  <td className="py-2 px-3">{nomAmbito(r.ambito)}</td>
                  <td className="py-2 px-3 text-xs">{r.profiles?.email ?? "—"}</td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 text-xs">
                      {cc.rojo > 0 && <><SemaforoDot color="rojo" /> {cc.rojo}</>}
                      {cc.amarillo > 0 && <><SemaforoDot color="amarillo" /> {cc.amarillo}</>}
                      {cc.verde > 0 && <><SemaforoDot color="verde" /> {cc.verde}</>}
                      <span className="text-slate-500 ml-1">/ {cc.total}</span>
                    </span>
                  </td>
                  <td className="py-2 px-3">{r.estado === "vigente" ? "Vigente" : "Eliminado"}</td>
                  <td className="py-2 px-3 text-right">
                    <Link href={`/ejecutivo/registro/${r.id}`} className="text-xs underline">ver</Link>
                  </td>
                </tr>
              );
            })}
            {(!regs || regs.length === 0) && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No hay registros con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
