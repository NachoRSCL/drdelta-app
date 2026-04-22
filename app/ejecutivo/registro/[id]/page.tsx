import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import GaugeChart from "@/components/GaugeChart";
import { COLOR_BG_SOFT, type Color } from "@/lib/semaforo";

export default async function ResultadoRegistroPage({
  params
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: registro } = await supabase
    .from("registros")
    .select("id, ambito, fecha, estado, campos(nombre), profiles(email)")
    .eq("id", id)
    .maybeSingle();

  if (!registro) notFound();

  const { data: valores } = await supabase
    .from("registro_valores")
    .select("valor, color, variables(id, nombre, unidad, corte_rojo, corte_verde, direccion)")
    .eq("registro_id", id);

  const variableIds = (valores ?? [])
    .map((v: any) => v.variables?.id)
    .filter(Boolean);

  const { data: textos } = variableIds.length
    ? await supabase
        .from("variable_textos")
        .select("variable_id, color, interpretacion, accion, solucion_addvise")
        .in("variable_id", variableIds)
    : { data: [] };

  const { data: ambitoRow } = await supabase
    .from("ambitos")
    .select("nombre")
    .eq("codigo", registro.ambito)
    .maybeSingle();

  const campoNombre = (registro as any).campos?.nombre ?? "";
  const fechaFmt = new Date(registro.fecha).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <section>
      <Link href="/ejecutivo/mis-registros" className="text-xs text-slate-500 hover:underline">
        ← Mis registros
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="label-up">Registro guardado ✓</p>
          <h1 className="text-2xl font-bold">{ambitoRow?.nombre} — {campoNombre}</h1>
          <p className="text-xs text-slate-500 mt-1">{fechaFmt}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ejecutivo/mis-registros" className="btn-ghost text-sm">Ver mis registros</Link>
          <Link href="/ejecutivo" className="btn-primary text-sm">Nuevo registro</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(valores ?? []).map((v: any) => {
          const color = v.color as Color | null;
          const t = (textos ?? []).find(
            (x: any) => x.variable_id === v.variables?.id && x.color === color
          );
          const soft = color ? COLOR_BG_SOFT[color] : "";
          const hasGaugeData =
            v.variables?.corte_rojo != null &&
            v.variables?.corte_verde != null &&
            v.variables?.direccion;

          return (
            <div key={v.variables?.id} className={`frame p-4 border ${soft}`}>
              <div className="font-semibold text-center mb-1">{v.variables?.nombre}</div>

              {hasGaugeData ? (
                <div className="flex justify-center">
                  <GaugeChart
                    valor={v.valor as number | null}
                    corteRojo={v.variables.corte_rojo as number}
                    corteVerde={v.variables.corte_verde as number}
                    direccion={v.variables.direccion as "normal" | "invertida"}
                    unidad={v.variables.unidad as string || ""}
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-2">
                  Valor: <b>{v.valor ?? "—"}{v.variables?.unidad ? ` ${v.variables.unidad}` : ""}</b>
                </div>
              )}

              {t && (
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="label-up">Interpretación</div>
                    <div className="text-sm">{t.interpretacion}</div>
                  </div>
                  <div>
                    <div className="label-up">Acción</div>
                    <div className="text-sm">{t.accion}</div>
                  </div>
                  <div>
                    <div className="label-up">Solución Addvise</div>
                    <div className="text-sm font-semibold">{t.solucion_addvise || "—"}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
