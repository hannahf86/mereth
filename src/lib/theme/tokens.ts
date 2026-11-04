// Mereth colour tokens — the single TypeScript source of truth for theming.
//
// These names mirror the --color-* custom properties defined in
// src/app/globals.css. The CSS file renders the defaults; this file is used to
// VALIDATE and RESOLVE festival theme overrides (see theme.ts) and for the
// Figma-sourced default values. Keep the two in sync — the contrast test guards
// the defaults, so a drift that breaks accessibility will fail CI.

export const COLOR_TOKENS = [
  "bg-page",
  "bg-surface",
  "bg-subtle",
  "brand-primary",
  "brand-primary-hover",
  "brand-primary-soft",
  "brand-on-primary",
  "brand-accent",
  "brand-accent-hover",
  "brand-accent-soft",
  "brand-highlight",
  "text-primary",
  "text-secondary",
  "text-heading",
  "text-inverse",
  "border-default",
  "border-focus",
  "feedback-success",
  "feedback-success-soft",
  "feedback-warning",
  "feedback-warning-soft",
  "feedback-error",
  "feedback-error-soft",
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

// Mereth default theme. Source: Figma "Mereth – Design" ▸ Branding ▸ Colour.
export const MERETH_DEFAULT_THEME: Record<ColorToken, string> = {
  "bg-page": "#f7f2e8",
  "bg-surface": "#ffffff",
  "bg-subtle": "#eef0ef",
  "brand-primary": "#0f4c4f",
  "brand-primary-hover": "#0b3a3c",
  "brand-primary-soft": "#d6e8e7",
  "brand-on-primary": "#ffffff",
  "brand-accent": "#c94a35",
  "brand-accent-hover": "#ab3f2d",
  "brand-accent-soft": "#fbe2dc",
  "brand-highlight": "#e2604a",
  "text-primary": "#1c2426",
  "text-secondary": "#5b6668",
  "text-heading": "#0b3a3c",
  "text-inverse": "#f7f2e8",
  "border-default": "#c9cfcf",
  "border-focus": "#0f4c4f",
  "feedback-success": "#2e7d4f",
  "feedback-success-soft": "#e3f0e8",
  "feedback-warning": "#9a6512",
  "feedback-warning-soft": "#f6ecd8",
  "feedback-error": "#b3261e",
  "feedback-error-soft": "#f8e2e0",
};
