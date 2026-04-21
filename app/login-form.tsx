"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="text-3xl">📬</div>
        <p className="mt-2 font-semibold">Revisa tu correo</p>
        <p className="text-sm text-slate-500 mt-1">
          Te enviamos un link para entrar a <b>{email}</b>. Haz clic y quedarás autenticado.
        </p>
        <button className="mt-4 text-xs underline text-slate-500" onClick={() => setStatus("idle")}>
          ¿Email equivocado? Vuelve a intentarlo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="label-up block">Email</label>
      <input
        type="email"
        required
        className="input"
        placeholder="tu@empresa.cl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Enviarme el link de acceso"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">Te enviamos un link por email. Sin contraseña.</p>
    </form>
  );
}
