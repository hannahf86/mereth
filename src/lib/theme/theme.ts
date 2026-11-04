import type { CSSProperties } from "react";
import {
  COLOR_TOKENS,
  MERETH_DEFAULT_THEME,
  type ColorToken,
} from "./tokens";
import { contrastRatio, meetsAA } from "./contrast";

// A festival theme is a partial set of colour-token overrides, stored as the
// JSONB `theme` column on `festivals`. Anything not overridden falls back to
// the Mereth default.
export type FestivalTheme = Partial<Record<ColorToken, string>>;

// Merge a festival's overrides onto the Mereth defaults.
export function resolveTheme(theme: FestivalTheme): Record<ColorToken, string> {
  const resolved = { ...MERETH_DEFAULT_THEME };
  for (const token of COLOR_TOKENS) {
    const value = theme[token];
    if (value) resolved[token] = value;
  }
  return resolved;
}

// Turn a festival theme into inline CSS custom properties to spread onto the
// festival layout root (e.g. <div style={themeToCssVars(theme)}>). Only the
// overridden tokens are emitted; the rest inherit the :root defaults.
export function themeToCssVars(theme: FestivalTheme): CSSProperties {
  const vars: Record<string, string> = {};
  for (const token of COLOR_TOKENS) {
    const value = theme[token];
    if (value) vars[`--color-${token}`] = value;
  }
  return vars as CSSProperties;
}

export interface ThemeContrastIssue {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
}

// The critical pairings that must pass AA (brief §9): text on the primary and
// accent brand colours. The accent is used for payment buttons, so a failing
// theme must be rejected rather than shipped.
export function validateThemeContrast(theme: FestivalTheme): {
  ok: boolean;
  issues: ThemeContrastIssue[];
} {
  const r = resolveTheme(theme);
  const pairs: { pair: string; fg: ColorToken; bg: ColorToken }[] = [
    { pair: "text on primary", fg: "brand-on-primary", bg: "brand-primary" },
    { pair: "text on accent", fg: "brand-on-primary", bg: "brand-accent" },
  ];

  const issues: ThemeContrastIssue[] = [];
  for (const { pair, fg, bg } of pairs) {
    const ratio = contrastRatio(r[fg], r[bg]);
    if (!meetsAA(ratio)) {
      issues.push({
        pair,
        foreground: r[fg],
        background: r[bg],
        ratio: Math.round(ratio * 100) / 100,
        required: 4.5,
      });
    }
  }
  return { ok: issues.length === 0, issues };
}
