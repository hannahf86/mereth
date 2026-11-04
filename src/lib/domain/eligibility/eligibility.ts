import { ageOn } from "./age";

// Age eligibility for a class. A competitor's age is calculated on the edition's
// cutoff date, never today. ageMax null = no upper limit; ageMin null = from 0.

export function isAgeEligible(
  age: number,
  ageMin: number | null,
  ageMax: number | null,
): boolean {
  return age >= (ageMin ?? 0) && (ageMax === null || age <= ageMax);
}

// Human, British-English age-range label, e.g. "12 & under", "14–16", "8 and over".
export function ageRangeLabel(
  ageMin: number | null,
  ageMax: number | null,
): string {
  if (ageMax === null) return `${ageMin ?? 0} and over`;
  if (!ageMin) return `${ageMax} & under`;
  return `${ageMin}–${ageMax}`;
}

export interface EligibilityInput {
  dob: string | Date;
  cutoff: string | Date;
  ageMin: number | null;
  ageMax: number | null;
}

export type EligibilityResult =
  | { eligible: true; age: number }
  | { eligible: false; age: number; reason: string };

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const age = ageOn(input.dob, input.cutoff);
  if (isAgeEligible(age, input.ageMin, input.ageMax)) {
    return { eligible: true, age };
  }
  const range = ageRangeLabel(input.ageMin, input.ageMax);
  const reason = `This class is for ages ${range}; they'd be ${age} on the cut-off date.`;
  return { eligible: false, age, reason };
}

// Pure helper for "suggested classes": given the competitor's age on the cutoff,
// return the classes they ARE eligible for (same-discipline filtering is done by
// the caller/query).
export function eligibleClasses<
  T extends { ageMin: number | null; ageMax: number | null },
>(age: number, classes: readonly T[]): T[] {
  return classes.filter((c) => isAgeEligible(age, c.ageMin, c.ageMax));
}
