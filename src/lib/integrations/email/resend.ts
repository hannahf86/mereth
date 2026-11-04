import "server-only";
import { Resend } from "resend";
import { getResendApiKey } from "@/lib/env";

// Returns a Resend client, or null when no API key is configured (callers
// degrade gracefully). Server-only.
export function getResend(): Resend | null {
  const key = getResendApiKey();
  return key ? new Resend(key) : null;
}
