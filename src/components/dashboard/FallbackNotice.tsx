import type { AnalysisMeta } from "@/lib/types";

type Stages = NonNullable<AnalysisMeta["stages"]>;
type StageKey = keyof Stages;

const STAGE_LABELS: Record<StageKey, string> = {
  extraction: "Extraction",
  spyglass: "Spyglass",
  ads: "Ad generation",
  shield: "Shield review",
};

interface FallbackNoticeProps {
  stages: Stages;
}

export function FallbackNotice({ stages }: FallbackNoticeProps) {
  const keys: StageKey[] = ["extraction", "spyglass", "ads", "shield"];
  const fallbacks = keys
    .map((key) => ({ key, status: stages[key] }))
    .filter(({ status }) => status.source === "fallback");

  if (fallbacks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 rounded-lg border border-aegis-gray/30 bg-aegis-gray/10 px-4 py-3">
      <p className="font-body text-sm font-medium text-aegis-silver mb-1.5">
        Aegis used sample data for {fallbacks.length === 1 ? "one step" : `${fallbacks.length} steps`} in this run.
      </p>
      <ul className="space-y-1">
        {fallbacks.map(({ key, status }) => (
          <li key={key} className="font-body text-xs text-aegis-gray leading-relaxed">
            <span className="text-aegis-silver">{STAGE_LABELS[key]}:</span>{" "}
            {status.fallbackReason ?? "Fell back to sample data."}
          </li>
        ))}
      </ul>
    </div>
  );
}