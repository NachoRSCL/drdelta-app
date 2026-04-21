-- ============================================================
--  DR DELTA · Row Level Security
--  Pegar después de 01_schema.sql
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.invitaciones     enable row level security;
alter table public.ambitos          enable row level security;
alter table public.campos           enable row level security;
alter table public.variables        enable row level security;
alter table public.variable_textos  enable row level security;
alter table public.registros        enable row level security;
alter table public.registro_valores enable row level security;

-- -----  profiles  -----
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin())
  with check (public.is_admin());

-- -----  invitaciones  (solo admin)  -----
drop policy if exists invitaciones_admin_all on public.invitaciones;
create policy invitaciones_admin_all on public.invitaciones
  for all using (public.is_admin())
  with check (public.is_admin());

-- -----  ambitos  -----
drop policy if exists ambitos_read on public.ambitos;
create policy ambitos_read on public.ambitos
  for select using (public.is_active_user());

-- -----  campos  -----
drop policy if exists campos_read on public.campos;
create policy campos_read on public.campos
  for select using (public.is_active_user());

drop policy if exists campos_admin_write on public.campos;
create policy campos_admin_write on public.campos
  for all using (public.is_admin())
  with check (public.is_admin());

-- -----  variables  -----
drop policy if exists variables_read on public.variables;
create policy variables_read on public.variables
  for select using (public.is_active_user());

drop policy if exists variables_admin_write on public.variables;
create policy variables_admin_write on public.variables
  for all using (public.is_admin())
  with check (public.is_admin());

-- -----  variable_textos  -----
drop policy if exists variable_textos_read on public.variable_textos;
create policy variable_textos_read on public.variable_textos
  for select using (public.is_active_user());

drop policy if exists variable_textos_admin_write on public.variable_textos;
create policy variable_textos_admin_write on public.variable_textos
  for all using (public.is_admin())
  with check (public.is_admin());

-- -----  registros  -----
--  ejecutivos y admin leen todos los vigentes (compartido por campo)
--  ejecutivos insertan sus propios registros
--  sólo pueden marcar como 'eliminado' sus propios registros de los últimos 7 días
drop policy if exists registros_select on public.registros;
create policy registros_select on public.registros
  for select using (public.is_active_user());

drop policy if exists registros_insert on public.registros;
create policy registros_insert on public.registros
  for insert with check (
    public.is_active_user()
    and ejecutivo_id = auth.uid()
  );

drop policy if exists registros_update_own_recent on public.registros;
create policy registros_update_own_recent on public.registros
  for update using (
    public.is_admin()
    or (ejecutivo_id = auth.uid() and estado = 'vigente' and fecha >= now() - interval '7 days')
  )
  with check (
    public.is_admin()
    or (ejecutivo_id = auth.uid() and estado in ('vigente','eliminado'))
  );

drop policy if exists registros_delete_admin on public.registros;
create policy registros_delete_admin on public.registros
  for delete using (public.is_admin());

-- -----  registro_valores  -----
drop policy if exists registro_valores_select on public.registro_valores;
create policy registro_valores_select on public.registro_valores
  for select using (public.is_active_user());

drop policy if exists registro_valores_insert on public.registro_valores;
create policy registro_valores_insert on public.registro_valores
  for insert with check (
    public.is_active_user()
    and exists (
      select 1 from public.registros r
      where r.id = registro_id and r.ejecutivo_id = auth.uid()
    )
  );

drop policy if exists registro_valores_admin on public.registro_valores;
create policy registro_valores_admin on public.registro_valores
  for all using (public.is_admin())
  with check (public.is_admin());
