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
  pageText: string;
  onPageTextChange: (value: string) => void;
  onAnalyze: () => void;
  onTrySample: () => void;
  isLoading: boolean;
}

export function InputCard({
  url,
  onUrlChange,
  platform,
  onPlatformChange,
  pageText,
  onPageTextChange,
  onAnalyze,
  onTrySample,
  isLoading,
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

      <label
        htmlFor="manual-page-text"
        className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2 block"
      >
        Manual Page Text
      </label>
      <p className="font-body text-xs text-aegis-gray/70 mb-2">
        Paste landing page copy for a live Spyglass test. Firecrawl isn&apos;t wired up yet, so
        this is the only way to run a real analysis — leave it blank to use sample data.
      </p>
      <textarea
        id="manual-page-text"
        value={pageText}
        onChange={(e) => onPageTextChange(e.target.value)}
        placeholder="Paste the competitor's landing page copy here (headline, body text, claims, CTA, etc.)"
        rows={5}
        className="w-full rounded-lg border border-aegis-border bg-aegis-black px-3 py-2.5 mb-6 font-body text-sm text-aegis-silver placeholder:text-aegis-gray/60 focus:outline-none focus:border-aegis-teal resize-y"
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={onAnalyze} disabled={isLoading}>
          <Search size={16} />
          {isLoading ? "Analyzing…" : "Analyze"}
        </Button>
        <Button variant="secondary" onClick={onTrySample} disabled={isLoading}>
          Try Sample Analysis
        </Button>
      </div>
    </Card>
  );
}