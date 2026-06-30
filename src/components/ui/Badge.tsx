import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "teal" | "aqua" | "gray" | "high" | "medium" | "low" | "none";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  teal: "bg-aegis-teal/10 text-aegis-teal border-aegis-teal/30",
  aqua: "bg-aegis-aqua/10 text-aegis-aqua border-aegis-aqua/30",
  gray: "bg-aegis-gray/10 text-aegis-gray border-aegis-gray/30",
  high: "bg-risk-high/10 text-risk-high border-risk-high/30",
  medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
  low: "bg-aegis-gray/10 text-aegis-gray border-aegis-gray/30",
  none: "bg-risk-none/10 text-risk-none border-risk-none/30",
};

export function Badge({ tone = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium font-body whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}