import { createClient as supabaseCreate } from "@supabase/supabase-js";

/** Cliente con Service Role Key — uso SOLO en server actions / route handlers */
export function createAdminClient() {
  return supabaseCreate(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
