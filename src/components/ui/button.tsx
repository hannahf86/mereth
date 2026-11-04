import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Button — matches Figma "Button" (10:50). One Primary per screen; Accent is
// reserved for payment. Also exported as buttonClasses for styling <Link>s.
export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
export type ButtonSize = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-xs rounded-md font-bold tracking-[0.2px] transition-colors disabled:pointer-events-none disabled:opacity-60";

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-[44px] px-lg py-sm text-base",
  sm: "min-h-[40px] px-md py-xs text-sm",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover",
  secondary:
    "border-2 border-brand-primary bg-bg-surface text-brand-primary hover:bg-brand-primary-soft",
  accent: "bg-brand-accent text-brand-on-primary hover:bg-brand-accent-hover",
  ghost: "text-brand-primary hover:bg-brand-primary-soft",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, sizeClasses[size], variantClasses[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
