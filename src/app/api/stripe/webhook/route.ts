import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/integrations/stripe/client";
import { getStripeWebhookSecret } from "@/lib/env";
import { createAdminClient } from "@/lib/db/supabase/admin";

// Stripe webhook — the single source of truth for marking orders paid and
// entries confirmed. Signature-verified and idempotent (deduped on event id).
export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: record the event id first; a duplicate means already handled.
  const { error: dupError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (dupError) {
    if (dupError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return new NextResponse("Database error", { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId && session.payment_status === "paid") {
      await admin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        })
        .eq("id", orderId);

      const { data: orderItems } = await admin
        .from("order_items")
        .select("entry_id")
        .eq("order_id", orderId);
      const entryIds = (orderItems ?? []).map((i) => i.entry_id);
      if (entryIds.length > 0) {
        await admin
          .from("entries")
          .update({ status: "confirmed" })
          .in("id", entryIds);
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await admin.from("orders").update({ status: "failed" }).eq("id", orderId);
      const { data: orderItems } = await admin
        .from("order_items")
        .select("entry_id")
        .eq("order_id", orderId);
      const entryIds = (orderItems ?? []).map((i) => i.entry_id);
      if (entryIds.length > 0) {
        // Return unpaid entries to the basket.
        await admin
          .from("entries")
          .update({ status: "basket" })
          .in("id", entryIds)
          .eq("status", "pending_payment");
      }
    }
  }

  return NextResponse.json({ received: true });
}
