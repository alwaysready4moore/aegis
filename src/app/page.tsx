"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InputCard } from "@/components/dashboard/InputCard";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { PipelineFlow } from "@/components/dashboard/PipelineFlow";
import { SpyglassSection } from "@/components/spyglass/SpyglassSection";
import { AdsSection } from "@/components/ads/AdsSection";
import { ShieldSection } from "@/components/shield/ShieldSection";
import type { AegisAnalysisResult, Platform, SectionId } from "@/lib/types";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("meta");
  const [result, setResult] = useState<AegisAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");

  // Stage 1: both buttons hit the same stub route and get back the hardcoded
  // sample fixture. The URL and platform fields are captured but not yet sent
  // anywhere meaningful — that wiring happens once Firecrawl/Gemini land.
  async function runAnalysis() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST" });
      if (!res.ok) throw new Error("Analysis failed. Please try again.");
      const data: AegisAnalysisResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function scrollToElement(targetElementId: string) {
    const el = document.getElementById(targetElementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleNavigate(section: SectionId, targetElementId: string) {
    setActiveSection(section);
    scrollToElement(targetElementId);
  }

  function handleNewPipeline() {
    setUrl("");
    setPlatform("general");
    setResult(null);
    setError(null);
    setActiveSection("dashboard");
    scrollToElement("top");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeSection={activeSection}
        hasResult={Boolean(result)}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">
        <div id="top" className="scroll-mt-6">
          <DashboardHeader onNewPipeline={handleNewPipeline} />

          <InputCard
            url={url}
            onUrlChange={setUrl}
            platform={platform}
            onPlatformChange={setPlatform}
            onAnalyze={runAnalysis}
            onTrySample={runAnalysis}
          />
        </div>

        {isLoading && (
          <p className="font-body text-sm text-aegis-gray mb-8">Running the Aegis pipeline…</p>
        )}

        {error && (
          <p className="font-body text-sm text-risk-high mb-8">{error}</p>
        )}

        {result && (
          <>
            <KpiCards kpi={result.kpi} />
            <SpyglassSection spyglass={result.spyglass} />
            <AdsSection ads={result.ads} />
            <ShieldSection shield={result.shield} ads={result.ads} />
          </>
        )}

        <PipelineFlow hasResult={Boolean(result)} />
      </main>
    </div>
  );
}