import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, getServiceRoleKey } from "@/lib/env";
import type { Database } from "@/lib/db/database.types";

// Service-role (secret key) client — BYPASSES RLS. Server-only.
// Use for: Stripe webhooks, Webflow sync, audit writes, and safe server-side
// reads for public pages (always with explicit field projections — never return
// dates of birth or contact details). Never import this into a Client Component.
export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  return createSupabaseClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    getServiceRoleKey(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
