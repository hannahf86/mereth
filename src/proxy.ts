import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/db/supabase/middleware";

// Next 16 "proxy" convention (formerly middleware). Refreshes the Supabase
// session on every request.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on all paths except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
