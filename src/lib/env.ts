import { z } from "zod";

// Environment validation. Kept lazy (functions, not top-level parsing) so that
// merely importing a module never crashes a build when secrets are absent —
// validation happens the first time a client is actually constructed.

// Public values are inlined into the client bundle, so they MUST be referenced
// as literal process.env.NEXT_PUBLIC_* keys for Next.js to replace them.
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type PublicEnv = z.infer<typeof publicSchema>;
let cachedPublic: PublicEnv | null = null;

export function getPublicEnv(): PublicEnv {
  if (cachedPublic) return cachedPublic;
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    );
  }
  cachedPublic = parsed.data;
  return cachedPublic;
}

// Server-only secret. Never import this into a Client Component.
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (server-only).");
  }
  return key;
}

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY (server-only).");
  return key;
}

export function getStripeWebhookSecret(): string {
  const key = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key) throw new Error("Missing STRIPE_WEBHOOK_SECRET (server-only).");
  return key;
}

// Email (Resend) is optional — features degrade gracefully when unset.
export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY ?? null;
}
export function getEmailFrom(): string | null {
  return process.env.EMAIL_FROM ?? null;
}
