// WCAG 2.x contrast primitives — pure, dependency-free, fully tested.
// Used to reject festival themes whose text/background pairings fail AA.

// Parse a #rgb or #rrggbb hex string into [r, g, b] (0–255).
function parseHex(hex: string): [number, number, number] {
  const cleaned = hex.trim().replace(/^#/, "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Invalid hex colour: "${hex}"`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

// sRGB channel → linear light (WCAG relative luminance formula).
function linearize(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// Contrast ratio between two colours, from 1 (identical) to 21 (black/white).
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// AA thresholds: 4.5:1 for normal text, 3:1 for large text / UI components.
export function meetsAA(ratio: number, large = false): boolean {
  return ratio >= (large ? 3 : 4.5);
}
