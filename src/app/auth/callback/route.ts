import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";

// Magic-link / PKCE callback: exchanges the one-time code for a session, then
// redirects to the originally requested page (`next`).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Only allow same-origin relative redirects.
      const safeNext = next.startsWith("/") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
