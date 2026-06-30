import { Badge } from "@/components/ui/Badge";
import { riskCategoryLabels } from "@/lib/utils";
import type { ShieldFinding, RiskLevel } from "@/lib/types";

const riskBadgeTone: Record<RiskLevel, "high" | "medium" | "low" | "none"> = {
  high: "high",
  medium: "medium",
  low: "low",
  none: "none",
};

interface FindingRowProps {
  finding: ShieldFinding;
}

export function FindingRow({ finding }: FindingRowProps) {
  return (
    <div className="py-4 border-b border-aegis-border last:border-b-0">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge tone={riskBadgeTone[finding.riskLevel]}>{finding.riskLevel} risk</Badge>
        <Badge tone="gray">{riskCategoryLabels[finding.riskCategory]}</Badge>
        <span className="font-body text-xs text-aegis-gray ml-auto">
          {finding.status === "rewritten" ? "Rewritten" : "Acceptable as-is"}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-1">
            Flagged phrase
          </div>
          <p className="font-body text-sm text-aegis-silver line-through decoration-risk-high/60">
            &ldquo;{finding.flaggedPhrase}&rdquo;
          </p>
          <p className="font-body text-xs text-aegis-gray mt-1.5 leading-relaxed">
            {finding.riskReason}
          </p>
        </div>
        <div>
          <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-1">
            Suggested rewrite
          </div>
          <p className="font-body text-sm text-aegis-teal">
            &ldquo;{finding.suggestedRewrite}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}