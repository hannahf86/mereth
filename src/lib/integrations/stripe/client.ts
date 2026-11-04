import "server-only";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/env";

// Server-only Stripe client (test mode in development). Uses the SDK's pinned
// API version.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(getStripeSecretKey());
  }
  return cached;
}
