import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface PipelineFlowProps {
  hasResult: boolean;
}

export function PipelineFlow({ hasResult }: PipelineFlowProps) {
  const steps = [
    {
      label: "Research",
      detail: hasResult ? "Competitor page analyzed" : "Awaiting a URL or sample run",
    },
    {
      label: "Review",
      detail: hasResult ? "Risks checked, safer ads ready" : "Runs after Spyglass analysis",
    },
    {
      label: "Deliver",
      detail: hasResult ? "Approved ads ready to copy" : "Runs after Shield review",
    },
  ];

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-body text-xs font-semibold",
                  hasResult
                    ? "border-aegis-teal bg-aegis-teal/10 text-aegis-teal"
                    : "border-aegis-border text-aegis-gray"
                )}
              >
                {hasResult ? <Check size={14} /> : i + 1}
              </div>
              <div>
                <div className="font-body text-sm font-medium text-aegis-silver">
                  {step.label}
                </div>
                <div className="font-body text-xs text-aegis-gray">{step.detail}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mx-4",
                  hasResult ? "bg-aegis-teal/40" : "bg-aegis-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}