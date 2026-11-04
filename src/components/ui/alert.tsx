import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Alert — matches Figma "Alert" (11:14). Inline messages:
// info (guidance), success (eligibility/confirmation), warning (deadlines/unpaid),
// error (blocking problems).
export type AlertTone = "info" | "success" | "warning" | "error";

const toneClasses: Record<AlertTone, string> = {
  info: "bg-brand-primary-soft",
  success: "bg-feedback-success-soft",
  warning: "bg-feedback-warning-soft",
  error: "bg-feedback-error-soft",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-col gap-2xs rounded-lg p-md",
        toneClasses[tone],
        className,
      )}
    >
      <p className="font-bold text-text-heading">{title}</p>
      {children ? (
        <div className="text-sm text-text-primary">{children}</div>
      ) : null}
    </div>
  );
}
