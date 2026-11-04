import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Badge — matches Figma "Badge" (10:98). Status labels:
// Entered (brand), 1st place (accent), Paid (success), Unpaid (warning),
// Ineligible (error), Draft (neutral).
export type BadgeTone =
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  brand: "bg-brand-primary-soft text-brand-primary-hover",
  accent: "bg-brand-accent-soft text-brand-accent-hover",
  success: "bg-feedback-success-soft text-feedback-success",
  warning: "bg-feedback-warning-soft text-feedback-warning",
  error: "bg-feedback-error-soft text-feedback-error",
  neutral: "bg-bg-subtle text-text-secondary",
};

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-sm py-2xs text-sm font-bold tracking-[0.1px]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
