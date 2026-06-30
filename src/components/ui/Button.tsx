import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-aegis-teal text-aegis-black hover:bg-aegis-aqua focus-visible:ring-aegis-aqua",
  secondary:
    "bg-transparent border border-aegis-border text-aegis-silver hover:border-aegis-teal hover:text-aegis-teal focus-visible:ring-aegis-teal",
  ghost:
    "bg-transparent text-aegis-gray hover:text-aegis-silver focus-visible:ring-aegis-gray",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium font-body transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-aegis-black",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}