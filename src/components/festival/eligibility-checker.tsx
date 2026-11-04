"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import {
  checkEligibility,
  eligibleClasses,
} from "@/lib/domain/eligibility/eligibility";

type Sibling = {
  code: string;
  title: string;
  ageMin: number | null;
  ageMax: number | null;
  href: string;
};

// P.02 eligibility check — enter the competitor's DOB, compute age on the
// edition cut-off (shared, tested logic), and show eligible / not-eligible with
// suggested same-discipline classes. This is a helpful preview; entries are
// still validated server-side at entry time.
export function EligibilityChecker({
  cutoffIso,
  cutoffLabel,
  ageMin,
  ageMax,
  thisCode,
  siblings,
  enterHref,
}: {
  cutoffIso: string;
  cutoffLabel: string;
  ageMin: number | null;
  ageMax: number | null;
  thisCode: string;
  siblings: Sibling[];
  enterHref: string;
}) {
  const [dob, setDob] = useState("");
  const result = dob
    ? checkEligibility({ dob, cutoff: cutoffIso, ageMin, ageMax })
    : null;
  const suggestions =
    result && !result.eligible
      ? eligibleClasses(result.age, siblings).filter((s) => s.code !== thisCode)
      : [];

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="dob"
          className="text-sm font-bold tracking-[0.1px] text-text-primary"
        >
          Competitor&apos;s date of birth
        </label>
        <input
          id="dob"
          type="date"
          value={dob}
          max="2030-12-31"
          onChange={(e) => setDob(e.target.value)}
          className="min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary"
        />
        <p className="text-sm text-text-secondary">
          We check age on {cutoffLabel}, not today. We never show this date
          publicly.
        </p>
      </div>

      {result?.eligible ? (
        <>
          <Alert tone="success" title="Eligible for this class">
            They&apos;ll be {result.age} on {cutoffLabel}.
          </Alert>
          <Link href={enterHref} className={buttonClasses("primary", "md", "w-full")}>
            Enter this class
          </Link>
        </>
      ) : result ? (
        <>
          <Alert tone="error" title="Not eligible for this class">
            {result.reason}
          </Alert>
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-xs">
              <p className="text-sm font-bold text-text-primary">
                Classes they are eligible for:
              </p>
              {suggestions.map((s) => (
                <Link
                  key={s.code}
                  href={s.href}
                  className="text-sm text-brand-primary hover:underline"
                >
                  {s.code} · {s.title}
                </Link>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
