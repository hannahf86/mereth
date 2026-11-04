import { describe, it, expect } from "vitest";
import { contrastRatio, meetsAA, relativeLuminance } from "./contrast";
import { validateThemeContrast } from "./theme";

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#0f4c4f", "#0f4c4f")).toBeCloseTo(1, 5);
  });

  it("is symmetric regardless of argument order", () => {
    expect(contrastRatio("#c94a35", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#c94a35"),
      5,
    );
  });

  it("matches the Figma-noted ratio for white on teal 700 (~9.7)", () => {
    expect(contrastRatio("#ffffff", "#0f4c4f")).toBeCloseTo(9.7, 0);
  });

  it("matches the Figma-noted ratio for white on coral 600 (~4.6)", () => {
    const ratio = contrastRatio("#ffffff", "#c94a35");
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratio).toBeCloseTo(4.6, 0);
  });

  it("accepts shorthand and hashless hex", () => {
    expect(contrastRatio("#000", "fff")).toBeCloseTo(21, 1);
  });

  it("throws on invalid hex", () => {
    expect(() => relativeLuminance("not-a-colour")).toThrow();
  });
});

describe("meetsAA", () => {
  it("requires 4.5 for normal text", () => {
    expect(meetsAA(4.5)).toBe(true);
    expect(meetsAA(4.49)).toBe(false);
  });

  it("requires only 3 for large text / UI", () => {
    expect(meetsAA(3, true)).toBe(true);
    expect(meetsAA(2.99, true)).toBe(false);
  });
});

describe("validateThemeContrast", () => {
  it("passes for the Mereth default theme", () => {
    const result = validateThemeContrast({});
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects a theme whose accent is too light for white text", () => {
    const result = validateThemeContrast({ "brand-accent": "#ffd9cc" });
    expect(result.ok).toBe(false);
    expect(result.issues.map((i) => i.pair)).toContain("text on accent");
  });

  it("rejects a theme whose primary is too light for white text", () => {
    const result = validateThemeContrast({ "brand-primary": "#8fd0d2" });
    expect(result.ok).toBe(false);
    expect(result.issues.map((i) => i.pair)).toContain("text on primary");
  });

  it("accepts a valid dark festival theme override", () => {
    const result = validateThemeContrast({
      "brand-primary": "#3b2a6b",
      "brand-accent": "#9c2a5b",
    });
    expect(result.ok).toBe(true);
  });
});
