import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth/user";
import { getFestivalBySlug, getOrderByReference } from "@/lib/db/queries";
import { formatFeePence } from "@/lib/format";
import { Panel } from "@/components/ui/panel";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

// P.07 Confirmed — shown after Stripe Checkout. The order is marked paid by the
// webhook, so immediately after redirect it may still be "pending" for a moment.
export default async function ConfirmedPage({
  params,
  searchParams,
}: PageProps<"/f/[festivalSlug]/basket/confirmed">) {
  const { festivalSlug } = await params;
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : null;

  const festival = await getFestivalBySlug(festivalSlug);
  if (!festival) notFound();
  const user = await getUser();
  if (!user) redirect(`/f/${festival.slug}/sign-in`);

  const order = ref ? await getOrderByReference(festival.id, ref) : null;
  const paid = order?.status === "paid";

  const items = (order?.order_items ?? []).map((oi) => {
    const entry = Array.isArray(oi.entries) ? oi.entries[0] : oi.entries;
    const cls = entry
      ? Array.isArray(entry.classes)
        ? entry.classes[0]
        : entry.classes
      : null;
    const comp = entry
      ? Array.isArray(entry.competitors)
        ? entry.competitors[0]
        : entry.competitors
      : null;
    return {
      amount: oi.amount_pence,
      code: cls?.code ?? "",
      title: cls?.title ?? "",
      competitor: comp ? `${comp.first_name} ${comp.last_name}` : "",
      piece: entry?.piece_title ?? null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-[42rem] flex-col gap-xl px-lg py-lg">
      <div className="flex flex-col gap-sm">
        <h1 className="text-3xl font-semibold">
          {paid ? "You're entered!" : "Payment received"}
        </h1>
        {order ? (
          <p className="text-lg text-text-secondary">
            Order reference <strong>{order.reference}</strong>
          </p>
        ) : (
          <p className="text-lg text-text-secondary">
            We couldn&apos;t find that order.
          </p>
        )}
      </div>

      {order ? (
        <>
          {paid ? (
            <Alert tone="success" title="Entries confirmed">
              Your places are booked. A receipt is on its way to {user.email}.
            </Alert>
          ) : (
            <Alert tone="info" title="Confirming your entries">
              We&apos;ve received your payment and are confirming your entries —
              this usually takes a few seconds. Refresh in a moment.
            </Alert>
          )}
          <Panel>
            <h2 className="text-2xl font-semibold">Your entries</h2>
            <div className="flex flex-col gap-sm">
              {items.map((i, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-md"
                >
                  <div className="flex flex-col gap-2xs">
                    <span className="text-xs font-bold uppercase tracking-[1.2px] text-brand-accent">
                      {i.code}
                    </span>
                    <span className="font-heading text-lg font-medium text-text-heading">
                      {i.title}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {i.competitor}
                      {i.piece ? ` · ${i.piece}` : ""}
                    </span>
                  </div>
                  <span className="text-base font-bold">
                    {formatFeePence(i.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border-default pt-md">
              <span className="text-base font-bold">Total paid</span>
              <span className="text-lg font-bold">
                {formatFeePence(order.total_pence)}
              </span>
            </div>
            <Badge tone="neutral">Awaiting timetable</Badge>
          </Panel>
        </>
      ) : null}

      <Link
        href={`/f/${festival.slug}`}
        className={buttonClasses("secondary", "md", "self-start")}
      >
        Back to the festival
      </Link>
    </main>
  );
}
