import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import SemaforoDot from "@/components/SemaforoDot";
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
    .select("valor, color, variables(id, nombre, unidad)")
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
          return (
            <div key={v.variables?.id} className={`frame p-5 border ${soft}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{v.variables?.nombre}</div>
                  <div className="text-xs text-slate-500">
                    Valor ingresado: <b>{v.valor}{v.variables?.unidad ? ` ${v.variables.unidad}` : ""}</b>
                  </div>
                </div>
                <SemaforoDot color={color} />
              </div>

              {t && (
                <>
                  <div className="mt-3 label-up">Interpretación</div>
                  <div className="text-sm">{t.interpretacion}</div>
                  <div className="mt-3 label-up">Acción</div>
                  <div className="text-sm">{t.accion}</div>
                  <div className="mt-3 label-up">Solución Addvise</div>
                  <div className="text-sm font-semibold">{t.solucion_addvise || "—"}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
