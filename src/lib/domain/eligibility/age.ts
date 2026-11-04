// TypeScript mirror of SQL public.age_on(dob, cutoff).
// Dates are date-only ('YYYY-MM-DD'); no timezone is involved. The eligibility
// test asserts this agrees with the SQL function's definition.

type DateParts = { year: number; month: number; day: number };

function toParts(value: string | Date): DateParts {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) {
      throw new Error(`Invalid date "${value}" (expected YYYY-MM-DD).`);
    }
    return { year: +match[1], month: +match[2], day: +match[3] };
  }
  // Use UTC parts so a Date is read as a plain calendar date.
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

// Whole years old on the cutoff date.
export function ageOn(dob: string | Date, cutoff: string | Date): number {
  const b = toParts(dob);
  const c = toParts(cutoff);
  const beforeBirthday =
    c.month < b.month || (c.month === b.month && c.day < b.day);
  return c.year - b.year - (beforeBirthday ? 1 : 0);
}
