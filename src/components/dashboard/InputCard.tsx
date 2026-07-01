"use client";

import { useState } from "react";
import { Link2, Search, ChevronDown, Info } from "lucide-react";
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
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleUrlChange(value: string) {
    onUrlChange(value);
    if (validationMessage) setValidationMessage(null);
  }

  function handlePageTextChange(value: string) {
    onPageTextChange(value);
    if (validationMessage) setValidationMessage(null);
  }

  function handleAnalyzeClick() {
    if (!url.trim() && !pageText.trim()) {
      setValidationMessage(
        "Enter a competitor URL above, or paste manual page text below, before analyzing."
      );
      return;
    }
    setValidationMessage(null);
    onAnalyze();
  }

  return (
    <Card className="mb-8">
      {/* Primary path: URL */}
      <label className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2 block">
        Competitor Landing Page URL
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-aegis-border bg-aegis-black px-3 py-2.5 mb-5">
        <Link2 size={16} className="text-aegis-gray shrink-0" />
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
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

      {/* Advanced path: manual page text, collapsed by default */}
      <details className="group mb-6 rounded-lg border border-aegis-border">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
          <span className="font-body text-xs uppercase tracking-wide text-aegis-gray">
            Advanced: Manual Page Text
          </span>
          <ChevronDown
            size={16}
            className="text-aegis-gray transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="px-3.5 pb-3.5">
          <p className="font-body text-xs text-aegis-gray/80 mb-2 leading-relaxed">
            For testing without Firecrawl, or if a page can&apos;t be scraped. Pasting text here
            bypasses Firecrawl entirely — Aegis uses this text instead of fetching the URL above.
          </p>
          <textarea
            value={pageText}
            onChange={(e) => handlePageTextChange(e.target.value)}
            placeholder="Paste the competitor's landing page copy here (headline, body text, claims, CTA, etc.)"
            rows={5}
            className="w-full rounded-lg border border-aegis-border bg-aegis-black px-3 py-2.5 font-body text-sm text-aegis-silver placeholder:text-aegis-gray/60 focus:outline-none focus:border-aegis-teal resize-y"
          />
        </div>
      </details>

      <div className="flex flex-wrap items-start gap-4">
        <div>
          <Button variant="primary" onClick={handleAnalyzeClick} disabled={isLoading}>
            <Search size={16} />
            {isLoading ? "Analyzing…" : "Analyze"}
          </Button>
          <p className="font-body text-xs text-aegis-gray/70 mt-1.5">
            Live analysis — can take up to a minute.
          </p>
        </div>
        <div>
          <Button variant="secondary" onClick={onTrySample} disabled={isLoading}>
            Try Sample Analysis
          </Button>
          <p className="font-body text-xs text-aegis-gray/70 mt-1.5">
            Instant — uses sample data.
          </p>
        </div>
      </div>

      {validationMessage && (
        <div className="flex items-start gap-2 mt-4 rounded-lg border border-risk-medium/30 bg-risk-medium/10 px-3.5 py-2.5">
          <Info size={15} className="text-risk-medium shrink-0 mt-0.5" />
          <p className="font-body text-sm text-aegis-silver">{validationMessage}</p>
        </div>
      )}
    </Card>
  );
}