// Human-readable order reference, e.g. MER-402817. Uniqueness is enforced by a
// DB unique constraint; the caller retries on clash.
export function generateOrderReference(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `MER-${n}`;
}

export function sumAmountsPence(amounts: readonly number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}
