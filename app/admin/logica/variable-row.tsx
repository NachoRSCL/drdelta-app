"use client";
import Link from "next/link";
import { useTransition } from "react";
import { toggleVariableActiva } from "./actions";

type Props = {
  id: string;
  nombre: string;
  ambito: string;
  ambitoNombre: string;
  unidad: string | null;
  direccion: "normal" | "invertida";
  corte_rojo: number;
  corte_verde: number;
  activa: boolean;
};

export default function VariableRow(p: Props) {
  const [pending, start] = useTransition();
  return (
    <tr className="border-b">
      <td className="py-2 px-3 text-xs text-slate-500">{p.ambitoNombre}</td>
      <td className="py-2 px-3 font-medium">{p.nombre}</td>
      <td className="py-2 px-3 text-slate-600">{p.unidad ?? "—"}</td>
      <td className="py-2 px-3 text-xs">
        {p.direccion === "normal" ? "Normal (↑ mejor)" : "Invertida (↓ mejor)"}
      </td>
      <td className="py-2 px-3 text-xs">
        🔴 {p.direccion === "normal" ? `< ${p.corte_rojo}` : `> ${p.corte_rojo}`}
      </td>
      <td className="py-2 px-3 text-xs">
        🟢 {p.direccion === "normal" ? `> ${p.corte_verde}` : `< ${p.corte_verde}`}
      </td>
      <td className="py-2 px-3">
        <span className={`text-xs px-2 py-1 rounded ${p.activa ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {p.activa ? "Activa" : "Inactiva"}
        </span>
      </td>
      <td className="py-2 px-3 text-right">
        <Link href={`/admin/logica/${p.id}`} className="text-xs underline mr-3">
          Editar
        </Link>
        <button
          disabled={pending}
          onClick={() => start(() => toggleVariableActiva(p.id, !p.activa))}
          className="text-xs underline text-slate-700 disabled:opacity-50"
        >
          {pending ? "…" : p.activa ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
