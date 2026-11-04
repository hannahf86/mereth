"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { removeBasketEntry } from "@/lib/entries/actions";
import { createCheckoutForBasket } from "@/lib/payments/actions";
import { formatFeePence } from "@/lib/format";

export type BasketItem = {
  id: string;
  code: string;
  title: string;
  fee: number;
  competitor: string;
  piece: string | null;
  composer: string | null;
};

// P.05 Review basket — list entries with remove, order summary, contact email,
// terms, and the payment CTA (accent, per the design).
export function BasketReview({
  items,
  total,
  festivalSlug,
  browseHref,
  contactEmail,
}: {
  items: BasketItem[];
  total: number;
  festivalSlug: string;
  browseHref: string;
  contactEmail: string;
}) {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  async function pay() {
    setPaying(true);
    setPayError("");
    const res = await createCheckoutForBasket(festivalSlug);
    if (res.ok) {
      window.location.href = res.url;
    } else {
      setPayError(res.error);
      setPaying(false);
    }
  }

  async function remove(id: string) {
    setRemoving(id);
    await removeBasketEntry(id);
    router.refresh();
    setRemoving(null);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-md">
        <p className="text-text-secondary">Your basket is empty.</p>
        <Link href={browseHref} className={buttonClasses("primary", "md")}>
          Browse the syllabus
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-start justify-between gap-md rounded-lg border border-border-default bg-bg-surface p-md"
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
                {i.piece
                  ? ` · ${i.composer ? i.composer + ": " : ""}${i.piece}`
                  : ""}
              </span>
            </div>
            <div className="flex flex-col items-end gap-xs">
              <span className="text-base font-bold">
                {formatFeePence(i.fee)}
              </span>
              <button
                type="button"
                onClick={() => remove(i.id)}
                disabled={removing === i.id}
                className="text-sm text-feedback-error hover:underline"
              >
                {removing === i.id ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border-default pt-md">
        <span className="text-base font-bold">Total</span>
        <span className="text-lg font-bold">{formatFeePence(total)}</span>
      </div>

      <p className="text-sm text-text-secondary">
        Confirmation and your receipt will go to {contactEmail}.
      </p>

      <label className="flex items-start gap-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <span className="text-sm text-text-primary">
          I agree to the festival&apos;s terms and refund policy.
        </span>
      </label>

      {payError ? (
        <Alert tone="error" title="Payment couldn&apos;t start">
          {payError}
        </Alert>
      ) : null}
      <Button
        variant="accent"
        onClick={pay}
        disabled={!terms || paying}
        className="w-full"
      >
        {paying ? "Redirecting to payment…" : `Pay ${formatFeePence(total)}`}
      </Button>
    </div>
  );
}
