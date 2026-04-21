"use client";

import { useTransition } from "react";
import { eliminarRegistro } from "./actions";

export default function DeleteButton({ registroId }: { registroId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className="text-red-600 hover:underline text-xs disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Eliminar este registro? No entrará a informes.")) return;

        start(async () => {
          await eliminarRegistro(registroId);
        });
      }}
    >
      {pending ? "…" : "Eliminar"}
    </button>
  );
}