import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { FindingRow } from "./FindingRow";
import { getAdById, platformLabels } from "@/lib/utils";
import type { ShieldReviewedAd, AdVariation, RiskLevel } from "@/lib/types";

const riskBadgeTone: Record<RiskLevel, "high" | "medium" | "low" | "none"> = {
  high: "high",
  medium: "medium",
  low: "low",
  none: "none",
};

interface ReviewedAdCardProps {
  reviewedAd: ShieldReviewedAd;
  ads: AdVariation[];
}

export function ReviewedAdCard({ reviewedAd, ads }: ReviewedAdCardProps) {
  const ad = getAdById(ads, reviewedAd.adVariationId);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          {ad && <Badge tone="gray">{platformLabels[ad.platform]}</Badge>}
          <span className="font-display text-sm font-semibold text-aegis-silver">
            {ad ? ad.hook : reviewedAd.adVariationId}
          </span>
        </div>
        <Badge tone={riskBadgeTone[reviewedAd.overallRiskLevel]}>
          Overall: {reviewedAd.overallRiskLevel} risk
        </Badge>
      </div>

      {reviewedAd.findings.length === 0 ? (
        <p className="font-body text-sm text-aegis-gray py-4">
          No risky language found. This ad is ready to test as-is.
        </p>
      ) : (
        <div className="mt-3">
          {reviewedAd.findings.map((finding) => (
            <FindingRow key={finding.id} finding={finding} />
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-aegis-border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-xs uppercase tracking-wide text-aegis-gray">
            Final compliant version
          </span>
          <CopyButton text={reviewedAd.finalCompliantVersion} label="Copy final version" />
        </div>
        <p className="font-body text-sm text-aegis-silver leading-relaxed bg-aegis-black rounded-lg border border-aegis-border p-3">
          {reviewedAd.finalCompliantVersion}
        </p>
      </div>
    </Card>
  );
}