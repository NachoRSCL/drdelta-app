"use client";
import { useState, useTransition } from "react";
import { editarCampo, toggleCampoActivo } from "./actions";

type Props = {
  id: string;
  nombre: string;
  comuna: string | null;
  activo: boolean;
};

export default function CampoRow({ id, nombre, comuna, activo }: Props) {
  const [editando, setEditando] = useState(false);
  const [pending, start] = useTransition();

  if (editando) {
    return (
      <tr className="border-b bg-slate-50">
        <td colSpan={4} className="py-2 px-3">
          <form
            action={async (fd) => {
              await editarCampo(fd);
              setEditando(false);
            }}
            className="flex flex-col sm:flex-row gap-2 items-start sm:items-end"
          >
            <input type="hidden" name="id" value={id} />
            <div className="flex-1">
              <label className="label-up">Nombre</label>
              <input
                name="nombre"
                defaultValue={nombre}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="label-up">Comuna</label>
              <input
                name="comuna"
                defaultValue={comuna ?? ""}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm">Guardar</button>
              <button type="button" onClick={() => setEditando(false)} className="btn-ghost text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b">
      <td className="py-2 px-3 font-medium">{nombre}</td>
      <td className="py-2 px-3 text-slate-600">{comuna ?? "—"}</td>
      <td className="py-2 px-3">
        <span className={`text-xs px-2 py-1 rounded ${activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="py-2 px-3 text-right">
        <button onClick={() => setEditando(true)} className="text-xs underline mr-3">
          Editar
        </button>
        <button
          disabled={pending}
onClick={() =>
  start(async () => {
    await toggleCampoActivo(id, !activo)
  })
}          className="text-xs underline text-slate-700 disabled:opacity-50"
        >
          {pending ? "…" : activo ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
