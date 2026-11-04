import type { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Labelled select (the Input family, 10:74). Native <select> for mobile
// usability and accessibility; the label is always linked via htmlFor/id.
export function Select({
  label,
  id,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-xs">
      <label
        htmlFor={id}
        className="text-sm font-bold tracking-[0.1px] text-text-primary"
      >
        {label}
      </label>
      <select
        id={id}
        className={cn(
          "min-h-[44px] w-full rounded-md border border-border-default bg-bg-surface px-md py-sm text-base text-text-primary",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
