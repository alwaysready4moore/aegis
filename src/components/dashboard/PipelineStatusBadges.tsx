import { Badge } from "@/components/ui/Badge";
import type { AnalysisMeta } from "@/lib/types";

type Stages = NonNullable<AnalysisMeta["stages"]>;
type StageKey = keyof Stages;

const STAGE_LABELS: Record<StageKey, string> = {
  extraction: "Extraction",
  spyglass: "Spyglass",
  ads: "Ads",
  shield: "Shield",
};

const SOURCE_LABELS: Record<string, string> = {
  live: "Live",
  manual: "Manual",
  firecrawl: "Firecrawl",
  fallback: "Fallback",
  skipped: "Skipped",
};

const SOURCE_TONE: Record<string, "teal" | "aqua" | "gray" | "medium"> = {
  live: "teal",
  manual: "aqua",
  firecrawl: "teal",
  fallback: "medium",
  skipped: "gray",
};

interface PipelineStatusBadgesProps {
  stages: Stages;
}

export function PipelineStatusBadges({ stages }: PipelineStatusBadgesProps) {
  const keys: StageKey[] = ["extraction", "spyglass", "ads", "shield"];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6">
      {keys.map((key) => {
        const status = stages[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="font-body text-xs text-aegis-gray">{STAGE_LABELS[key]}</span>
            <Badge tone={SOURCE_TONE[status.source] ?? "gray"}>
              {SOURCE_LABELS[status.source] ?? status.source}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}