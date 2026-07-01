import { Link2, Search, Sparkles, ShieldCheck, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";

const steps = [
  { icon: Link2, title: "Paste a competitor URL" },
  { icon: Search, title: "Spyglass finds the angle" },
  { icon: Sparkles, title: "Aegis drafts ads" },
  { icon: ShieldCheck, title: "Shield checks risk" },
  { icon: Copy, title: "Copy safer versions" },
];

export function HowItWorksStrip() {
  return (
    <Card className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-aegis-teal/30 bg-aegis-teal/10 text-aegis-teal text-[11px] font-semibold">
                {i + 1}
              </div>
              <div>
                <Icon size={14} className="text-aegis-teal mb-1" />
                <div className="font-body text-xs text-aegis-silver leading-snug">
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}