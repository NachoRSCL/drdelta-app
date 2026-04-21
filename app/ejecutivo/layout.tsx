import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default async function EjecutivoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, email, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.activo) redirect("/");

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/ejecutivo" className="flex items-center gap-2">
            <Logo size={26} withWord />
            <span className="text-slate-300">|</span>
            <span className="font-semibold">DR Delta</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/ejecutivo/mis-registros" className="text-slate-600 hover:underline">
              Mis registros
            </Link>
            {profile.rol === "admin" && (
              <Link href="/admin" className="text-slate-600 hover:underline">Admin</Link>
            )}
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 hidden sm:inline">{profile.email}</span>
            <form action="/auth/logout" method="post">
              <button className="text-slate-600 hover:underline">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
