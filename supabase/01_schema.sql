-- ============================================================
--  DR DELTA · Schema (Postgres / Supabase)
--  Pegar completo en SQL Editor de Supabase y ejecutar.
-- ============================================================

-- Extensions (Supabase already has these, kept for clarity)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  profiles : 1:1 con auth.users, rol del usuario
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  rol        text not null default 'ejecutivo' check (rol in ('admin','ejecutivo')),
  activo     boolean not null default true,
  creado     timestamptz not null default now()
);
create index if not exists profiles_email_idx on public.profiles (lower(email));

-- ------------------------------------------------------------
--  invitaciones : quién puede entrar (el admin agrega filas aquí)
-- ------------------------------------------------------------
create table if not exists public.invitaciones (
  email         text primary key,
  rol           text not null default 'ejecutivo' check (rol in ('admin','ejecutivo')),
  invitado_por  uuid references public.profiles(id),
  creado        timestamptz not null default now()
);

-- ------------------------------------------------------------
--  ambitos : catálogo fijo (4 filas)
-- ------------------------------------------------------------
create table if not exists public.ambitos (
  codigo text primary key,
  nombre text not null,
  orden  int  not null
);

insert into public.ambitos (codigo, nombre, orden) values
  ('ambiente',     'Ambiente e Inmunidad', 1),
  ('conservacion', 'Conservación y Dieta', 2),
  ('metabolismo',  'Metabolismo Interno',  3),
  ('suelo',        'Suelo y Pradera',      4)
on conflict (codigo) do nothing;

-- ------------------------------------------------------------
--  campos : "predios"
-- ------------------------------------------------------------
create table if not exists public.campos (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activo boolean not null default true,
  creado timestamptz not null default now()
);

-- ------------------------------------------------------------
--  variables : tabla Lógica (umbrales del semáforo)
-- ------------------------------------------------------------
create table if not exists public.variables (
  id          uuid primary key default gen_random_uuid(),
  ambito      text not null references public.ambitos(codigo),
  nombre      text not null,
  unidad      text not null default '',
  direccion   text not null default 'normal' check (direccion in ('normal','invertida')),
  corte_rojo  numeric not null,
  corte_verde numeric not null,
  activa      boolean not null default true,
  creado      timestamptz not null default now(),
  unique (ambito, nombre)
);
create index if not exists variables_ambito_idx on public.variables (ambito) where activa = true;

-- ------------------------------------------------------------
--  variable_textos : 3 filas por variable (rojo/amarillo/verde)
-- ------------------------------------------------------------
create table if not exists public.variable_textos (
  variable_id      uuid not null references public.variables(id) on delete cascade,
  color            text not null check (color in ('rojo','amarillo','verde')),
  interpretacion   text not null default '',
  accion           text not null default '',
  solucion_addvise text not null default '',
  primary key (variable_id, color)
);

-- ------------------------------------------------------------
--  registros : cabecera por (campo, ámbito, fecha, ejecutivo)
-- ------------------------------------------------------------
create table if not exists public.registros (
  id            uuid primary key default gen_random_uuid(),
  campo_id      uuid not null references public.campos(id),
  ambito        text not null references public.ambitos(codigo),
  ejecutivo_id  uuid not null references public.profiles(id),
  fecha         timestamptz not null default now(),
  estado        text not null default 'vigente' check (estado in ('vigente','eliminado')),
  eliminado_en  timestamptz,
  creado        timestamptz not null default now()
);
create index if not exists registros_campo_ambito_idx on public.registros (campo_id, ambito, fecha desc);
create index if not exists registros_ejecutivo_idx on public.registros (ejecutivo_id, fecha desc);

-- ------------------------------------------------------------
--  registro_valores : un valor por variable dentro de un registro
--  color: calculado al guardar (redundante pero útil para lectura)
-- ------------------------------------------------------------
create table if not exists public.registro_valores (
  registro_id uuid not null references public.registros(id) on delete cascade,
  variable_id uuid not null references public.variables(id),
  valor       numeric,
  color       text check (color in ('rojo','amarillo','verde')),
  primary key (registro_id, variable_id)
);

-- ------------------------------------------------------------
--  Auto-creación de profile cuando un usuario se autentica
--  Requiere email en invitaciones; si no, bloquea con mensaje.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv_rol text;
begin
  select rol into inv_rol
  from public.invitaciones
  where lower(email) = lower(new.email);

  if inv_rol is null then
    raise exception 'El correo % no está invitado. Contacta al administrador.', new.email
      using errcode = 'P0001';
  end if;

  insert into public.profiles (id, email, rol, activo)
  values (new.id, new.email, inv_rol, true)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
--  Helper: saber si el usuario actual es admin
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol = 'admin' and activo = true
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and activo = true
  );
$$;
