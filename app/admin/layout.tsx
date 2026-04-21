import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, email, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.activo || profile.rol !== "admin") redirect("/ejecutivo");

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size={36} />
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 bg-slate-100 rounded px-2 py-0.5">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/ejecutivo" className="text-slate-600 hover:underline">Ir a ejecutivo</Link>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 hidden sm:inline">{profile.email}</span>
            <form action="/auth/logout" method="post">
              <button className="text-slate-600 hover:underline">Salir</button>
            </form>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 pb-0 flex gap-1 text-sm">
          <AdminTab href="/admin/usuarios" label="Usuarios" />
          <AdminTab href="/admin/logica" label="Lógica" />
          <AdminTab href="/admin/campos" label="Campos" />
          <AdminTab href="/admin/registros" label="Registros" />
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function AdminTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 border-b-2 border-transparent hover:border-slate-300 text-slate-600 hover:text-slate-900"
    >
      {label}
    </Link>
  );
}
