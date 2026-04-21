"use client";
import { useState, useTransition } from "react";
import { guardarRegistro } from "./actions";
import Link from "next/link";

type V = {
  id: string;
  nombre: string;
  unidad: string;
  direccion: "normal" | "invertida";
  corte_rojo: number;
  corte_verde: number;
};

export default function RegistroForm({
  campoId, ambito, variables
}: { campoId: string; ambito: string; variables: V[] }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    setError("");
    const entries = Object.entries(valores)
      .filter(([, v]) => v.trim() !== "")
      .map(([k, v]) => ({ variable_id: k, valor: Number(v.replace(",", ".")) }));

    if (entries.some((e) => Number.isNaN(e.valor))) {
      setError("Algún valor no es un número válido.");
      return;
    }
    if (entries.length === 0) {
      setError("Ingresa al menos una variable antes de guardar.");
      return;
    }

    startTransition(async () => {
      const res = await guardarRegistro({ campoId, ambito, valores: entries });
      if (res.error) setError(res.error);
      // si ok, server action redirige
    });
  }

  return (
    <div className="space-y-3">
      {variables.map((v) => (
        <div key={v.id} className="frame p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">{v.nombre}</div>
            <div className="text-xs text-slate-500">{v.unidad || "—"}</div>
          </div>
          <input
            className="input w-32 text-right"
            inputMode="decimal"
            placeholder="0"
            value={valores[v.id] ?? ""}
            onChange={(e) => setValores((s) => ({ ...s, [v.id]: e.target.value }))}
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Link href={`/ejecutivo/campo/${campoId}`} className="btn-ghost">Cancelar</Link>
        <button className="btn-primary" disabled={pending} onClick={submit}>
          {pending ? "Guardando…" : "Guardar registro"}
        </button>
      </div>
    </div>
  );
}
