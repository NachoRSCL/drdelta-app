# DR Delta — App Addvise

App interna para que los ejecutivos de terreno registren variables por campo y ámbito, obtengan un semáforo (🔴 🟡 🟢) con interpretación / acción / solución Addvise, y los administradores manejen usuarios, lógica de cortes, campos y registros.

Stack: **Next.js 15** (App Router) + **Supabase** (Postgres + Auth magic link + RLS) + **Tailwind**. Pensado para correr gratis en Vercel + Supabase free tier.

---

## 1. Crear el proyecto de Supabase

1. Entra a https://supabase.com → Sign up (con el mismo Google de Addvise, recomendado) → **New project**.
2. Elige la región más cercana: **South America (São Paulo)** (`sa-east-1`).
3. Password de Postgres: cualquiera, **anótala** (la vas a necesitar si después quieres conectarte con psql). Igual podemos sacarla después.
4. Plan: **Free**.
5. Espera ~2 minutos a que aprovisione.

Una vez creado, en el proyecto:

- **Settings → API** → copia:
  - `Project URL`  → será `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public key`  → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role key`  → será `SUPABASE_SERVICE_ROLE_KEY` (⚠️ solo en server, nunca en el cliente)

- **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3000` (en desarrollo) o tu URL de Vercel en producción.
  - Additional redirect URLs: agrega ambas (`http://localhost:3000/auth/callback` y `https://<tu-app>.vercel.app/auth/callback`).

- **Authentication → Providers → Email**:
  - Asegúrate de que `Email` esté habilitado (viene por defecto).
  - Desactiva `Confirm email` si quieres que el magic link funcione al primer click (recomendado para esta app).

---

## 2. Cargar schema, RLS y seed

En **SQL Editor** del proyecto, ejecuta **en orden** los 3 archivos que están en `./supabase/`:

1. `01_schema.sql` — tablas, funciones, triggers.
2. `02_rls.sql` — políticas de Row Level Security.
3. `03_seed.sql` — crea la invitación del admin (`ignacio@nextmove.cl`), campos de demo y 12 variables de ejemplo.

> Si después cambias el email del admin, edita la primera línea de `03_seed.sql` antes de correrlo.

Con esto ya puedes entrar a la app y empezar a cargar cosas.

---

## 3. Variables de entorno (local)

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

Nunca commitees `.env.local`.

---

## 4. Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — debería aparecer el login con el logo AddVise. Pide el magic link a tu email, haz click → entras al panel según tu rol.

---

## 5. Deploy a Vercel

1. Sube el repo a GitHub (`nachors/drdelta-app` o como quieras).
2. https://vercel.com → **Add new project** → importa el repo.
3. Framework: Next.js (auto-detect).
4. **Environment Variables** → agrega las 3 mismas que tienes en `.env.local`.
5. Deploy.
6. Cuando te dé la URL (ej: `https://drdelta-app.vercel.app`):
   - Vuelve a Supabase → **Authentication → URL Configuration** → actualiza el `Site URL` y agrega `https://drdelta-app.vercel.app/auth/callback` a Redirect URLs.

---

## 6. Estructura

```
app/
  page.tsx                    # home + login (magic link)
  auth/callback/              # recibe el token de Supabase
  auth/logout/                # cierra sesión
  ejecutivo/                  # flujo ejecutivo
    page.tsx                  # seleccionar campo
    campo/[campoId]/          # seleccionar ámbito
    campo/[campoId]/[ambito]/ # formulario de variables + server action
    registro/[id]/            # resultado semáforo
    mis-registros/            # historial + eliminar (ventana 7 días)
  admin/                      # sólo rol=admin
    usuarios/                 # invitar, activar/desactivar, cambiar rol
    logica/                   # listar y editar variables + textos (rojo/amarillo/verde)
    logica/[id]/              # editor de una variable
    campos/                   # CRUD de campos/lecherías
    registros/                # vista global con filtros
lib/
  semaforo.ts                 # función evaluarColor()
  supabase/                   # client / server / admin / middleware
components/
  Logo.tsx                    # logo AddVise (SVG)
  SemaforoDot.tsx             # punto de color
supabase/
  01_schema.sql
  02_rls.sql
  03_seed.sql
```

---

## 7. Cómo agregar usuarios

Los usuarios **no se auto-registran**. El admin:

1. Va a `/admin/usuarios`.
2. Escribe el email y elige rol (`ejecutivo` o `admin`).
3. Esa persona recibe nada todavía — debe ir a la home de la app y pedir su magic link.
4. Cuando hace click, el trigger `handle_new_user` revisa la tabla `invitaciones` y crea el `profile` con el rol correcto.

Si el email no está en invitaciones, el signup falla con mensaje claro.

---

## 8. Lógica del semáforo

Cada variable tiene:

- `direccion`: `normal` (mayor = mejor) o `invertida` (menor = mejor).
- `corte_rojo`, `corte_verde`: dos valores umbral. Todo lo del medio es **amarillo**.

Ejemplos:

- MS del concentrado — normal — rojo < 86, verde > 89.
- BHB — invertida — rojo > 1.2, verde < 0.8.

Ver `lib/semaforo.ts`.

---

## 9. TODO / roadmap post-MVP

- [ ] Exportar registros a Excel / PDF.
- [ ] Gráfico evolutivo por campo × variable.
- [ ] Adjuntar fotos al registro.
- [ ] Notificación por email cuando aparezcan muchos rojos en un campo.
- [ ] Logo oficial en formato vectorial (hoy hay un SVG aproximado en `/public/addvise-logo.svg`).
