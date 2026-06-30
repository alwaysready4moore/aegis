import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { AegisAnalysisResultSchema, SpyglassResultSchema } from "@/lib/schemas";
import { sampleAnalysis } from "@/lib/sample-data";
import { buildSpyglassPrompt } from "@/lib/prompts";
import { parseAiJson } from "@/lib/ai-parsing";
import { generateJsonContent } from "@/lib/gemini";
import type { AegisAnalysisResult, Platform } from "@/lib/types";

interface AnalyzeRequestBody {
  sourceUrl?: string;
  platform?: Platform;
  /**
   * Optional raw page text. Stage 3 uses this to test Spyglass without
   * Firecrawl — Stage 4 will populate this automatically from a scraped URL
   * instead of requiring it in the request body.
   */
  pageText?: string;
}

/** Builds a sample-mode result, optionally marked as a fallback with a reason. */
function sampleFallbackResult(reason?: string): AegisAnalysisResult {
  return {
    ...sampleAnalysis,
    meta: {
      source: "sample",
      usedFallback: Boolean(reason),
      ...(reason ? { fallbackReason: reason } : {}),
    },
  };
}

/**
 * Builds a result for a request that supplied a real sourceUrl/platform but
 * couldn't get a usable Spyglass result from Gemini. Keeps the requested
 * sourceUrl/platform so the response still reflects what was asked for, but
 * fills spyglass/ads/shield/kpi from the sample fixture so the UI has
 * something complete to render instead of a partial or broken result.
 */
function liveFallbackResult(
  sourceUrl: string,
  platform: Platform,
  reason: string
): AegisAnalysisResult {
  return {
    ...sampleAnalysis,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    sourceUrl,
    platform,
    meta: {
      source: "live",
      usedFallback: true,
      fallbackReason: reason,
    },
  };
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody = {};
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    // No body, or invalid JSON. The current dashboard buttons (Analyze / Try
    // Sample Analysis) call this route with no body at all, so this is the
    // expected path for both until the input form is wired to send real
    // values — that's a later step, not part of this Spyglass wiring.
    body = {};
  }

  const { sourceUrl, platform, pageText } = body;

  // No pageText supplied: Stage 1 sample mode, unchanged.
  if (!pageText || pageText.trim().length === 0) {
    const result = sampleFallbackResult();
    const parsed = AegisAnalysisResultSchema.safeParse(result);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Sample data failed schema validation.", details: parsed.error.flatten() },
        { status: 500 }
      );
    }
    return NextResponse.json(parsed.data);
  }

  // pageText was supplied, but there isn't enough to run a live analysis —
  // fall back to sample rather than guessing at a missing URL or platform.
  if (!sourceUrl || !platform) {
    const result = sampleFallbackResult(
      "pageText was provided without a valid sourceUrl and platform, so sample data was returned instead."
    );
    const parsed = AegisAnalysisResultSchema.safeParse(result);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Sample fallback failed schema validation.", details: parsed.error.flatten() },
        { status: 500 }
      );
    }
    return NextResponse.json(parsed.data);
  }

  // --- Live path: pageText, sourceUrl, and platform are all present. ---

  const prompt = buildSpyglassPrompt({ sourceUrl, platform, pageText });
  const geminiResult = await generateJsonContent(prompt);

  if (!geminiResult.success) {
    return NextResponse.json(
      liveFallbackResult(sourceUrl, platform, `Gemini call failed: ${geminiResult.message}`)
    );
  }

  const parsed = parseAiJson(geminiResult.text, SpyglassResultSchema);

  if (!parsed.success) {
    const reason =
      parsed.error.stage === "json_parse"
        ? `Gemini response was not valid JSON: ${parsed.error.message}`
        : `Gemini response did not match the expected Spyglass shape: ${parsed.error.message}`;
    return NextResponse.json(liveFallbackResult(sourceUrl, platform, reason));
  }

  // Spyglass succeeded. Ad generation and Shield review are not wired yet —
  // those are the next Stage 3 steps. Sample data fills those sections for
  // now so every part of the UI still has something to render; only the
  // Spyglass Analysis section reflects real Gemini output at this point.
  const liveResult: AegisAnalysisResult = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    sourceUrl,
    platform,
    spyglass: parsed.data,
    ads: sampleAnalysis.ads,
    shield: sampleAnalysis.shield,
    kpi: sampleAnalysis.kpi,
    meta: {
      source: "live",
      usedFallback: false,
    },
  };

  const finalCheck = AegisAnalysisResultSchema.safeParse(liveResult);
  if (!finalCheck.success) {
    return NextResponse.json(
      liveFallbackResult(
        sourceUrl,
        platform,
        "Constructed result failed final schema validation."
      )
    );
  }

  return NextResponse.json(finalCheck.data);
}