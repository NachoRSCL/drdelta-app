import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SemaforoDot from "@/components/SemaforoDot";
import DeleteButton from "./delete-button";

type SearchParams = Promise<{
  ambito?: string;
  campo?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}>;

export default async function MisRegistrosPage({
  searchParams,
}: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: ambitos }, { data: campos }] = await Promise.all([
    supabase.from("ambitos").select("codigo, nombre").order("orden"),
    supabase.from("campos").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  let q = supabase
    .from("registros")
    .select("id, fecha, ambito, estado, campos(nombre)")
    .eq("ejecutivo_id", user.id)
    .order("fecha", { ascending: false })
    .limit(100);

  if (sp.ambito) q = q.eq("ambito", sp.ambito);
  if (sp.campo) q = q.eq("campo_id", sp.campo);
  if (sp.estado === "vigente" || sp.estado === "eliminado") q = q.eq("estado", sp.estado);
  if (sp.desde) q = q.gte("fecha", sp.desde);
  if (sp.hasta) q = q.lte("fecha", `${sp.hasta}T23:59:59`);

  const { data: regs } = await q;

  const nomAmbito = (c: string) => ambitos?.find((a) => a.codigo === c)?.nombre ?? c;

  const ids = (regs ?? []).map((r) => r.id);
  const { data: rv } = ids.length
    ? await supabase.from("registro_valores").select("registro_id, color").in("registro_id", ids)
    : { data: [] };

  const cuentaColor = new Map<string, { rojo: number; amarillo: number; verde: number; total: number }>();
  (rv ?? []).forEach((r: any) => {
    const c = cuentaColor.get(r.registro_id) ?? { rojo: 0, amarillo: 0, verde: 0, total: 0 };
    c.total += 1;
    if (r.color === "rojo") c.rojo += 1;
    else if (r.color === "amarillo") c.amarillo += 1;
    else if (r.color === "verde") c.verde += 1;
    cuentaColor.set(r.registro_id, c);
  });

  const now = Date.now();
  const hayFiltros = sp.ambito || sp.campo || sp.estado || sp.desde || sp.hasta;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="label-up">Mis registros</p>
          <h1 className="text-2xl font-bold">Historial</h1>
        </div>
        <Link href="/ejecutivo" className="btn-primary text-sm">Nuevo registro</Link>
      </div>

      {/* Filtros */}
      <form method="get" className="frame p-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div>
          <label className="label-up">Ámbito</label>
          <select name="ambito" defaultValue={sp.ambito ?? ""} className="w-full border rounded px-3 py-2 bg-white text-sm">
            <option value="">Todos</option>
            {(ambitos ?? []).map((a: any) => (
              <option key={a.codigo} value={a.codigo}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-up">Campo</label>
          <select name="campo" defaultValue={sp.campo ?? ""} className="w-full border rounded px-3 py-2 bg-white text-sm">
            <option value="">Todos</option>
            {(campos ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-up">Estado</label>
          <select name="estado" defaultValue={sp.estado ?? ""} className="w-full border rounded px-3 py-2 bg-white text-sm">
            <option value="">Todos</option>
            <option value="vigente">Vigentes</option>
            <option value="eliminado">Eliminados</option>
          </select>
        </div>
        <div>
          <label className="label-up">Desde</label>
          <input type="date" name="desde" defaultValue={sp.desde ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="label-up">Hasta</label>
          <input type="date" name="hasta" defaultValue={sp.hasta ?? ""} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-5 flex gap-2">
          <button className="btn-primary text-sm">Filtrar</button>
          {hayFiltros && (
            <Link href="/ejecutivo/mis-registros" className="btn-ghost text-sm">Limpiar</Link>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="frame overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500 uppercase">
            <tr className="border-b">
              <th className="py-2 px-3">Fecha</th>
              <th className="py-2 px-3">Campo</th>
              <th className="py-2 px-3">Ámbito</th>
              <th className="py-2 px-3">Semáforos</th>
              <th className="py-2 px-3">Estado</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {(regs ?? []).map((r) => {
              const fecha = new Date(r.fecha);
              const diasAtras = (now - fecha.getTime()) / 86400000;
              const puedeBorrar = r.estado === "vigente" && diasAtras <= 7;
              const cc = cuentaColor.get(r.id) ?? { rojo: 0, amarillo: 0, verde: 0, total: 0 };
              return (
                <tr key={r.id} className={`border-b ${r.estado === "eliminado" ? "text-slate-400 italic" : ""}`}>
                  <td className="py-3 px-3">{fecha.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="py-3 px-3">{(r as any).campos?.nombre}</td>
                  <td className="py-3 px-3">{nomAmbito(r.ambito)}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1">
                      {cc.rojo > 0 && <><SemaforoDot color="rojo" /> {cc.rojo}</>}
                      {cc.amarillo > 0 && <><SemaforoDot color="amarillo" /> {cc.amarillo}</>}
                      {cc.verde > 0 && <><SemaforoDot color="verde" /> {cc.verde}</>}
                      <span className="text-xs text-slate-500 ml-1">/ {cc.total}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">{r.estado === "vigente" ? "Vigente" : "Eliminado"}</td>
                  <td className="py-2 pr-3 text-right">
                    <Link href={`/ejecutivo/registro/${r.id}`} className="text-xs underline mr-3">ver</Link>
                    {puedeBorrar ? (
                      <DeleteButton registroId={r.id} />
                    ) : r.estado === "vigente" ? (
                      <span className="text-xs text-slate-400">Fuera de ventana</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {(!regs || regs.length === 0) && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  {hayFiltros ? "No hay registros con esos filtros." : "Aún no tienes registros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Puedes eliminar sólo registros de los últimos 7 días. Los eliminados no entran a informes.
      </p>
    </section>
  );
}
