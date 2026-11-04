import { describe, it, expect } from "vitest";
import { generateOrderReference, sumAmountsPence } from "./reference";

describe("generateOrderReference", () => {
  it("matches MER-###### and varies", () => {
    const refs = new Set(
      Array.from({ length: 50 }, () => generateOrderReference()),
    );
    for (const r of refs) expect(r).toMatch(/^MER-\d{6}$/);
    expect(refs.size).toBeGreaterThan(1);
  });
});

describe("sumAmountsPence", () => {
  it("sums integer pence", () => {
    expect(sumAmountsPence([1200, 1400, 1600])).toBe(4200);
    expect(sumAmountsPence([])).toBe(0);
  });
});
