import { CircleDot, ShieldCheck, FileCheck2, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { KpiSummary } from "@/lib/types";

interface KpiCardsProps {
  kpi: KpiSummary;
}

export function KpiCards({ kpi }: KpiCardsProps) {
  const items = [
    { label: "Angles Found", value: kpi.anglesFound, icon: CircleDot },
    { label: "Risks Checked", value: kpi.risksChecked, icon: ShieldCheck },
    { label: "Safer Ads Delivered", value: kpi.saferAdsDelivered, icon: FileCheck2 },
    { label: "Pipeline Health", value: `${kpi.pipelineHealth}%`, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-xs uppercase tracking-wide text-aegis-gray">
              {label}
            </span>
            <Icon size={16} className="text-aegis-teal" />
          </div>
          <div className="font-display text-2xl font-semibold text-aegis-silver">
            {value}
          </div>
        </Card>
      ))}
    </div>
  );
}