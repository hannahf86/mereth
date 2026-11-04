import { createClient } from "@/lib/db/supabase/server";

// Current authenticated user (or null), verified against Supabase Auth.
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
