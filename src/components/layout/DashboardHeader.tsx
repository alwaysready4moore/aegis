import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardHeader() {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-aegis-silver">
          Competitive Pipeline
        </h1>
        <p className="font-body text-sm text-aegis-gray mt-1">
          Turn competitor landing pages into compliance-checked ad variations.
        </p>
      </div>
      <Button variant="primary" className="shrink-0">
        <Plus size={16} />
        New Pipeline
      </Button>
    </div>
  );
}