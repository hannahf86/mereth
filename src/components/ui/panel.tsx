import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Panel — the white card container used throughout the entrant flow, plus a
// brand (teal) variant for the festival intro.
export function Panel({
  tone = "surface",
  className,
  children,
}: {
  tone?: "surface" | "brand";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-lg rounded-lg border p-lg",
        tone === "brand"
          ? "border-transparent bg-brand-primary text-text-inverse"
          : "border-border-default bg-bg-surface",
        className,
      )}
    >
      {children}
    </section>
  );
}
