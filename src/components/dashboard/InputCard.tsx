"use client";

import { Link2, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, platformLabels } from "@/lib/utils";
import type { Platform } from "@/lib/types";

const platforms: Platform[] = ["meta", "google", "tiktok", "taboola", "general"];

interface InputCardProps {
  url: string;
  onUrlChange: (value: string) => void;
  platform: Platform;
  onPlatformChange: (value: Platform) => void;
  onAnalyze: () => void;
  onTrySample: () => void;
}

export function InputCard({
  url,
  onUrlChange,
  platform,
  onPlatformChange,
  onAnalyze,
  onTrySample,
}: InputCardProps) {
  return (
    <Card className="mb-8">
      <label className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2 block">
        Competitor landing page URL
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-aegis-border bg-aegis-black px-3 py-2.5 mb-5">
        <Link2 size={16} className="text-aegis-gray shrink-0" />
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://competitor.com/products/fat-burner-pro"
          className="w-full bg-transparent font-body text-sm text-aegis-silver placeholder:text-aegis-gray/60 focus:outline-none"
        />
      </div>

      <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
        Select platform
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPlatformChange(p)}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm font-body transition-colors",
              platform === p
                ? "border-aegis-teal text-aegis-teal bg-aegis-teal/10"
                : "border-aegis-border text-aegis-gray hover:text-aegis-silver hover:border-aegis-gray"
            )}
          >
            {platformLabels[p]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={onAnalyze}>
          <Search size={16} />
          Analyze
        </Button>
        <Button variant="secondary" onClick={onTrySample}>
          Try Sample Analysis
        </Button>
      </div>
    </Card>
  );
}