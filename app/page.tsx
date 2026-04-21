import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import LoginForm from "./login-form";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol, activo")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.activo) {
      redirect(profile.rol === "admin" ? "/admin" : "/ejecutivo");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Logo size={44} />
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight">DR Delta</h1>
          <p className="mt-2 text-sm text-slate-500">
            Mediciones <span className="mx-1">→</span> Decisiones <span className="mx-1">→</span> Litros
          </p>
        </div>

        <div className="frame p-6 mt-8">
          <LoginForm />
        </div>

        <p className="mt-4 text-xs text-center text-slate-400">
          Acceso sólo para usuarios invitados por el administrador.
        </p>
      </div>
    </main>
  );
}
