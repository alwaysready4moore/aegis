import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  onNewPipeline: () => void;
}

export function DashboardHeader({ onNewPipeline }: DashboardHeaderProps) {
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

      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/about"
          className="font-body text-sm text-aegis-gray transition-colors hover:text-aegis-teal"
        >
          About
        </Link>

        <Button variant="primary" onClick={onNewPipeline}>
          <Plus size={16} />
          New Pipeline
        </Button>
      </div>
    </div>
  );
}