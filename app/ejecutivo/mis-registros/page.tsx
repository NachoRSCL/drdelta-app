import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SemaforoDot from "@/components/SemaforoDot";
import DeleteButton from "./delete-button";

export default async function MisRegistrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: regs } = await supabase
    .from("registros")
    .select("id, fecha, ambito, estado, campos(nombre)")
    .eq("ejecutivo_id", user.id)
    .order("fecha", { ascending: false })
    .limit(100);

  const { data: ambitos } = await supabase.from("ambitos").select("codigo, nombre");
  const nomAmbito = (c: string) => ambitos?.find((a) => a.codigo === c)?.nombre ?? c;

  // contadores de color por registro
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

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="label-up">Mis registros</p>
          <h1 className="text-2xl font-bold">Historial</h1>
        </div>
        <Link href="/ejecutivo" className="btn-primary text-sm">Nuevo registro</Link>
      </div>

      <div className="frame overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500 uppercase">
            <tr className="border-b">
              <th className="py-2 px-3">Fecha</th>
              <th>Campo</th>
              <th>Ámbito</th>
              <th>Semáforos</th>
              <th>Estado</th>
              <th></th>
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
                  <td>{(r as any).campos?.nombre}</td>
                  <td>{nomAmbito(r.ambito)}</td>
                  <td>
                    <span className="inline-flex items-center gap-1">
                      {cc.rojo > 0 && <><SemaforoDot color="rojo" /> {cc.rojo}</>}
                      {cc.amarillo > 0 && <><SemaforoDot color="amarillo" /> {cc.amarillo}</>}
                      {cc.verde > 0 && <><SemaforoDot color="verde" /> {cc.verde}</>}
                      <span className="text-xs text-slate-500 ml-1">/ {cc.total}</span>
                    </span>
                  </td>
                  <td>{r.estado === "vigente" ? "Vigente" : "Eliminado"}</td>
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
            {!regs || regs.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-slate-500">Aún no tienes registros.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-3">Puedes eliminar sólo registros de los últimos 7 días. Los eliminados no entran a informes.</p>
    </section>
  );
}
