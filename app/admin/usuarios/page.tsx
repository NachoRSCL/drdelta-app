import { createClient } from "@/lib/supabase/server";
import { invitarUsuario } from "./actions";
import UserRow from "./user-row";

export default async function UsuariosPage() {
  const supabase = await createClient();

  const [{ data: invites }, { data: profiles }] = await Promise.all([
    supabase.from("invitaciones").select("email, rol, activo").order("email"),
    supabase.from("profiles").select("email, rol, activo").order("email"),
  ]);

  // merge: la invitación es la fuente; si además existe profile, lo marcamos registrado
  const byEmail = new Map<string, { email: string; rol: "admin" | "ejecutivo"; activo: boolean; registrado: boolean }>();
  (invites ?? []).forEach((i: any) =>
    byEmail.set(i.email, { email: i.email, rol: i.rol, activo: i.activo, registrado: false })
  );
  (profiles ?? []).forEach((p: any) => {
    const prev = byEmail.get(p.email);
    byEmail.set(p.email, {
      email: p.email,
      rol: (prev?.rol ?? p.rol) as any,
      activo: prev?.activo ?? p.activo,
      registrado: true,
    });
  });
  const rows = Array.from(byEmail.values());

  return (
    <section className="space-y-6">
      <div>
        <p className="label-up">Admin · Usuarios</p>
        <h1 className="text-2xl font-bold">Quién puede entrar</h1>
        <p className="text-sm text-slate-500 mt-1">
          Los usuarios ingresan con magic link. Primero debes invitarlos aquí: sólo los emails de esta lista pueden iniciar sesión.
        </p>
      </div>

      <form action={invitarUsuario} className="frame p-4 flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <label className="label-up">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="nombre@empresa.cl"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="label-up">Rol</label>
          <select name="rol" defaultValue="ejecutivo" className="border rounded px-3 py-2 bg-white">
            <option value="ejecutivo">Ejecutivo</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button className="btn-primary">Invitar</button>
      </form>

      <div className="frame overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500 uppercase">
            <tr className="border-b">
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Rol</th>
              <th className="py-2 px-3">Registro</th>
              <th className="py-2 px-3">Estado</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <UserRow key={r.email} {...r} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Aún no hay usuarios invitados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
