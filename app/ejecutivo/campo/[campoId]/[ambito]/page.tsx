import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import RegistroForm from "./form";

export default async function FormularioAmbitoPage({
  params
}: { params: Promise<{ campoId: string; ambito: string }> }) {
  const { campoId, ambito } = await params;
  const supabase = await createClient();

  const [{ data: campo }, { data: ambitoRow }, { data: variables }] = await Promise.all([
    supabase.from("campos").select("id, nombre").eq("id", campoId).maybeSingle(),
    supabase.from("ambitos").select("codigo, nombre").eq("codigo", ambito).maybeSingle(),
    supabase
      .from("variables")
      .select("id, nombre, unidad, direccion, corte_rojo, corte_verde")
      .eq("ambito", ambito)
      .eq("activa", true)
      .order("nombre")
  ]);

  if (!campo || !ambitoRow) notFound();

  return (
    <section>
      <Link href={`/ejecutivo/campo/${campoId}`} className="text-xs text-slate-500 hover:underline">
        ← Cambiar ámbito
      </Link>
      <div className="mt-2 mb-4">
        <p className="label-up">Paso 3</p>
        <h1 className="text-2xl font-bold">{ambitoRow.nombre} — {campo.nombre}</h1>
        <p className="text-xs text-slate-500 mt-1">
          Fecha: hoy · deja en blanco las variables que no midas.
        </p>
      </div>

      {!variables || variables.length === 0 ? (
        <div className="frame p-6 text-slate-600">
          Aún no hay variables definidas en este ámbito. Pídele al administrador que las cargue.
        </div>
      ) : (
        <RegistroForm campoId={campoId} ambito={ambito} variables={variables} />
      )}
    </section>
  );
}
