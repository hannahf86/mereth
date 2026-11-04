"use server";

import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { getPublicEnv } from "@/lib/env";

const emailSchema = z.string().trim().toLowerCase().email();
const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

// Passwordless sign-in. Supabase sends an email containing BOTH a magic link
// (→ /auth/callback) and a 6-digit code, so people on phones can use whichever
// is easier. `next` is preserved so the chosen class survives sign-in (P.03).
export async function requestEmailOtp(
  email: string,
  next = "/",
): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const safeNext = next.startsWith("/") ? next : "/";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(
        safeNext,
      )}`,
    },
  });

  if (error) {
    return { ok: false, error: "We couldn't send your sign-in email. Please try again." };
  }
  return { ok: true };
}

// Verify the 6-digit email code (the alternative to clicking the magic link).
export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<AuthResult> {
  const parsedEmail = emailSchema.safeParse(email);
  const parsedToken = otpSchema.safeParse(token);
  if (!parsedEmail.success || !parsedToken.success) {
    return { ok: false, error: "Please check the code and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsedEmail.data,
    token: parsedToken.data,
    type: "email",
  });

  if (error) {
    return { ok: false, error: "That code didn't work. It may have expired." };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
