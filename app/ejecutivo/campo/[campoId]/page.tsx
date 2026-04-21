import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SeleccionarAmbitoPage({
  params
}: { params: Promise<{ campoId: string }> }) {
  const { campoId } = await params;
  const supabase = await createClient();

  const [{ data: campo }, { data: ambitos }] = await Promise.all([
    supabase.from("campos").select("id, nombre").eq("id", campoId).maybeSingle(),
    supabase.from("ambitos").select("codigo, nombre, orden").order("orden")
  ]);

  if (!campo) notFound();

  return (
    <section>
      <Link href="/ejecutivo" className="text-xs text-slate-500 hover:underline">
        ← Cambiar campo
      </Link>
      <div className="mt-2 flex items-end justify-between mb-4">
        <div>
          <p className="label-up">Paso 2 · {campo.nombre}</p>
          <h1 className="text-2xl font-bold">¿Qué vas a medir hoy?</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ambitos?.map((a) => (
          <Link key={a.codigo} href={`/ejecutivo/campo/${campoId}/${a.codigo}`} className="card-link">
            <div className="label-up">Ámbito {a.orden}</div>
            <div className="text-lg font-bold mt-1">{a.nombre}</div>
            <div className="text-xs text-slate-500 mt-1">Ingresar mediciones →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
