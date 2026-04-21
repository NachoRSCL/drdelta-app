import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SeleccionarCampoPage() {
  const supabase = await createClient();
  const { data: campos } = await supabase
    .from("campos")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="label-up">Paso 1</p>
          <h1 className="text-2xl font-bold">¿Con qué campo vas a trabajar?</h1>
        </div>
      </div>

      {!campos || campos.length === 0 ? (
        <div className="frame p-6 text-slate-600">
          No hay campos activos todavía. Pide al administrador que agregue campos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {campos.map((c) => (
            <Link key={c.id} href={`/ejecutivo/campo/${c.id}`} className="card-link">
              <div className="font-semibold">{c.nombre}</div>
              <div className="text-xs text-slate-500 mt-1">Seleccionar →</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
