"use client";
import { useTransition } from "react";
import { cambiarEstadoUsuario, cambiarRolUsuario } from "./actions";

type Props = {
  email: string;
  rol: "admin" | "ejecutivo";
  activo: boolean;
  registrado: boolean;
};

export default function UserRow({ email, rol, activo, registrado }: Props) {
  const [pending, start] = useTransition();

  return (
    <tr className="border-b">
      <td className="py-2 px-3">{email}</td>
      <td className="py-2 px-3">
        <select
          defaultValue={rol}
          disabled={pending}
          onChange={(e) => {
            const v = e.target.value as "admin" | "ejecutivo";
            start(() => cambiarRolUsuario(email, v));
          }}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="ejecutivo">Ejecutivo</option>
          <option value="admin">Administrador</option>
        </select>
      </td>
      <td className="py-2 px-3">
        {registrado ? (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Registrado</span>
        ) : (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Invitado</span>
        )}
      </td>
      <td className="py-2 px-3">
        <span className={`text-xs px-2 py-1 rounded ${activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-2 px-3 text-right">
        <button
          disabled={pending}
          onClick={() => start(() => cambiarEstadoUsuario(email, !activo))}
          className="text-xs underline text-slate-700 disabled:opacity-50"
        >
          {pending ? "…" : activo ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
