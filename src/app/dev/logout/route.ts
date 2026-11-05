import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";

// DEV ONLY. Signs the current test user out and returns home. 404s in production.
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
}
