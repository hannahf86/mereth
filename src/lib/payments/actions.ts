"use server";

import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getFestivalBySlug, getLatestEdition } from "@/lib/db/queries";
import { getPublicEnv } from "@/lib/env";
import { getStripe } from "@/lib/integrations/stripe/client";
import { generateOrderReference } from "@/lib/payments/reference";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

// P.06 — create a Stripe Checkout session for the user's basket. Amounts are
// computed server-side from class fees. The order is only marked paid by the
// webhook (checkout.session.completed); this just reserves it as `pending`.
export async function createCheckoutForBasket(
  festivalSlug: string,
): Promise<CheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) return { ok: false, error: "Festival not found." };
  const edition = await getLatestEdition(festival.id);
  if (!edition) return { ok: false, error: "This festival isn't open." };
  if (edition.status !== "entries_open") {
    return { ok: false, error: "Entries for this festival are closed." };
  }

  const { data: entries } = await supabase
    .from("entries")
    .select(
      "id, classes(code, title, fee_pence), competitors(first_name, last_name)",
    )
    .eq("festival_id", festival.id)
    .eq("status", "basket");
  if (!entries || entries.length === 0) {
    return { ok: false, error: "Your basket is empty." };
  }

  const items = entries.map((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    const comp = Array.isArray(e.competitors)
      ? e.competitors[0]
      : e.competitors;
    return {
      entryId: e.id,
      amount: cls?.fee_pence ?? 0,
      code: cls?.code ?? "",
      title: cls?.title ?? "Entry",
      competitor: comp ? `${comp.first_name} ${comp.last_name}` : "",
    };
  });
  const total = items.reduce((sum, i) => sum + i.amount, 0);

  // Create the order with a unique human reference (retry on clash).
  let reference = generateOrderReference();
  let orderId: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        festival_id: festival.id,
        edition_id: edition.id,
        profile_id: user.id,
        total_pence: total,
        status: "pending",
        reference,
      })
      .select("id")
      .single();
    if (!error && data) {
      orderId = data.id;
      break;
    }
    if (error?.code === "23505") {
      reference = generateOrderReference();
      continue;
    }
    return { ok: false, error: "We couldn't start checkout." };
  }
  if (!orderId) return { ok: false, error: "We couldn't start checkout." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((i) => ({
      order_id: orderId as string,
      entry_id: i.entryId,
      amount_pence: i.amount,
    })),
  );
  if (itemsError) return { ok: false, error: "We couldn't start checkout." };

  // Reserve the entries while payment is in progress.
  await supabase
    .from("entries")
    .update({ status: "pending_payment" })
    .in(
      "id",
      items.map((i) => i.entryId),
    )
    .eq("status", "basket");

  // Connect destination (full amount to the festival) when the festival has a
  // connected account; otherwise charge the platform test account (dev).
  const admin = createAdminClient();
  const { data: integ } = await admin
    .from("festival_integrations")
    .select("stripe_connect_account_id")
    .eq("festival_id", festival.id)
    .maybeSingle();
  const destination = integ?.stripe_connect_account_id ?? null;

  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    client_reference_id: orderId,
    metadata: { order_id: orderId, reference },
    line_items: items.map((i) => ({
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: i.amount,
        product_data: {
          name: `${i.code} ${i.title}`.trim(),
          description: i.competitor || undefined,
        },
      },
    })),
    ...(destination
      ? {
          payment_intent_data: {
            on_behalf_of: destination,
            transfer_data: { destination },
          },
        }
      : {}),
    success_url: `${NEXT_PUBLIC_APP_URL}/f/${festival.slug}/basket/confirmed?ref=${reference}`,
    cancel_url: `${NEXT_PUBLIC_APP_URL}/f/${festival.slug}/basket`,
  });

  if (!session.url) return { ok: false, error: "We couldn't start checkout." };

  await supabase
    .from("orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", orderId);

  return { ok: true, url: session.url };
}
