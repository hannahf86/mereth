// Small display formatters (British English). Festival times render in the
// festival's timezone (Europe/London for MVP).

const TZ = "Europe/London";

export function formatFeePence(pence: number): string {
  return pence % 100 === 0
    ? `£${pence / 100}`
    : `£${(pence / 100).toFixed(2)}`;
}

export function minutesLabel(seconds: number | null): string | null {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  return `${mins} minute${mins === 1 ? "" : "s"}`;
}

// "1 September 2026" (date-only, no timezone shift).
export function formatDateLong(dateOnly: string): string {
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

// "19–21 March 2027" (collapses month/year when the range shares them).
export function formatDateRange(startOnly: string, endOnly: string): string {
  const [sy, sm, sd] = startOnly.split("-").map(Number);
  const [ey, em, ed] = endOnly.split("-").map(Number);
  const monthYear = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(ey, em - 1, ed)));
  if (sy === ey && sm === em) return `${sd}–${ed} ${monthYear}`;
  const startLabel = formatDateLong(startOnly);
  return `${startLabel} – ${formatDateLong(endOnly)}`;
}

// "Friday 12 February 2027 at 23:59" (timestamptz, in festival timezone).
export function formatDeadline(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(d);
  return `${date} at ${time}`;
}
