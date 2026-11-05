import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";

// DEV ONLY. Establishes a real session for a test user without email, for local
// testing of auth-gated flows. Creates a proper GoTrue user + profile if needed.
// 404s outside development.
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get("email") ?? "tester@mereth.dev";
  const fullName = searchParams.get("name") ?? "Test Parent";
  const next = searchParams.get("next") ?? "/";

  const admin = createAdminClient();

  // Ensure a GoTrue-valid user exists (ignore "already registered").
  await admin.auth.admin
    .createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    .catch(() => {});

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const otp = data?.properties?.email_otp;
  const userId = data?.user?.id;
  if (error || !otp || !userId) {
    return new NextResponse(
      `dev login failed: ${error?.message ?? "no OTP returned"}`,
      { status: 500 },
    );
  }

  // Ensure a profile row exists (the auto-create trigger may not be applied yet).
  await admin
    .from("profiles")
    .upsert({ id: userId, email, full_name: fullName });

  // Optionally grant a festival role for testing admin/steward flows:
  // /dev/login?festival=alderford&role=owner
  const festivalSlug = searchParams.get("festival");
  const role = searchParams.get("role");
  if (festivalSlug && role) {
    const { data: fest } = await admin
      .from("festivals")
      .select("id")
      .eq("slug", festivalSlug)
      .maybeSingle();
    if (fest) {
      await admin
        .from("festival_members")
        .upsert(
          { festival_id: fest.id, profile_id: userId, role: role as never },
          { onConflict: "festival_id,profile_id,role" },
        );
    }
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });
  if (verifyError) {
    return new NextResponse(`verify failed: ${verifyError.message}`, {
      status: 500,
    });
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
}
