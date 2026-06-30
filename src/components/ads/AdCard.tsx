import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { platformLabels } from "@/lib/utils";
import type { AdVariation } from "@/lib/types";

interface AdCardProps {
  ad: AdVariation;
}

export function AdCard({ ad }: AdCardProps) {
  const fullCopy = `${ad.hook}\n\n${ad.body}\n\n${ad.cta}`;

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <Badge tone="teal">{platformLabels[ad.platform]}</Badge>
        <span className="font-body text-xs text-aegis-gray">{ad.angle}</span>
      </div>

      <div className="flex-1 mb-4">
        <div className="font-display text-base font-semibold text-aegis-silver mb-2 leading-snug">
          {ad.hook}
        </div>
        <p className="font-body text-sm text-aegis-gray leading-relaxed mb-3">{ad.body}</p>
        <div className="inline-flex font-body text-xs font-medium text-aegis-teal border border-aegis-teal/30 rounded-md px-2.5 py-1">
          {ad.cta}
        </div>
      </div>

      <div className="pt-3 border-t border-aegis-border">
        <p className="font-body text-xs text-aegis-gray leading-relaxed mb-3">{ad.reasoning}</p>
        <CopyButton text={fullCopy} label="Copy ad" />
      </div>
    </Card>
  );
}