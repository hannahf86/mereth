// Tiny className joiner (truthy strings). Intentionally not tailwind-merge —
// components are written so classes don't conflict.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
