import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  AegisAnalysisResultSchema,
  SpyglassResultSchema,
  AdVariationListSchema,
  ShieldReviewSchema,
} from "@/lib/schemas";
import { sampleAnalysis } from "@/lib/sample-data";
import {
  buildSpyglassPrompt,
  buildAdGenerationPrompt,
  buildShieldReviewPrompt,
} from "@/lib/prompts";
import { parseAiJson, stripCodeFences } from "@/lib/ai-parsing";
import { generateJsonContent } from "@/lib/gemini";
import { validateShieldReview } from "@/lib/shield-validation";
import type {
  AegisAnalysisResult,
  AnalysisMeta,
  StageStatus,
  Platform,
  SpyglassResult,
  AdVariationList,
  ShieldReview,
} from "@/lib/types";

interface AnalyzeRequestBody {
  sourceUrl?: string;
  platform?: Platform;
  /**
   * Optional raw page text. Stage 3 uses this to test Spyglass + ad
   * generation + Shield review without Firecrawl — Stage 4 will populate
   * this automatically from a scraped URL instead of requiring it in the
   * request body.
   */
  pageText?: string;
}

const SKIPPED: StageStatus = { source: "skipped" };
const LIVE: StageStatus = { source: "live" };

function fallback(reason: string): StageStatus {
  return { source: "fallback", fallbackReason: reason };
}

/**
 * Builds a more specific reason when ad-generation validation fails because
 * Gemini returned the wrong number of ads, rather than the generic "didn't
 * match the expected shape" message. Re-parses the same text parseAiJson
 * already validated against — cheap, and only runs on the failure path.
 * Falls back to a generic note if the raw response isn't even a JSON array.
 */
function describeAdListIssue(rawText: string): string {
  try {
    const raw = JSON.parse(stripCodeFences(rawText));
    if (Array.isArray(raw) && raw.length !== 5) {
      return `Gemini returned ${raw.length} ad${raw.length === 1 ? "" : "s"} instead of the required 5.`;
    }
  } catch {
    // Raw text wasn't valid JSON at all — the generic shape-mismatch message covers this case.
  }
  return "Gemini response did not match the required 5-ad shape.";
}

/**
 * Builds the meta object for a response. `overallSource` mirrors the
 * original Stage 3a meaning ("sample" only when nothing was attempted live).
 * `usedFallback`/`fallbackReason` are a rollup across stages, computed here
 * so the existing dashboard notice (which reads only those two fields)
 * keeps working without any UI changes.
 */
function buildMeta(
  overallSource: "sample" | "live",
  spyglass: StageStatus,
  ads: StageStatus,
  shield: StageStatus
): AnalysisMeta {
  const fallbackStage = [spyglass, ads, shield].find((s) => s.source === "fallback");
  return {
    source: overallSource,
    usedFallback: Boolean(fallbackStage),
    ...(fallbackStage?.fallbackReason ? { fallbackReason: fallbackStage.fallbackReason } : {}),
    stages: { spyglass, ads, shield },
  };
}

/** Validates a result against the schema before sending it, as a last-resort safety net. */
function respond(result: AegisAnalysisResult) {
  const parsed = AegisAnalysisResultSchema.safeParse(result);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Result failed schema validation.", details: parsed.error.flatten() },
      { status: 500 }
    );
  }
  return NextResponse.json(parsed.data);
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody = {};
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    // No body, or invalid JSON — this is the expected path whenever a
    // caller (e.g. "Try Sample Analysis") sends a bodyless POST.
    body = {};
  }

  const { sourceUrl, platform, pageText } = body;

  // --- Branch A: no pageText — pure Stage 1 sample mode, unchanged. ---
  if (!pageText || pageText.trim().length === 0) {
    return respond({
      ...sampleAnalysis,
      meta: buildMeta("sample", SKIPPED, SKIPPED, SKIPPED),
    });
  }

  // --- Branch B: pageText given, but not enough to run live (missing sourceUrl/platform). ---
  if (!sourceUrl || !platform) {
    return respond({
      ...sampleAnalysis,
      meta: buildMeta(
        "sample",
        fallback(
          "pageText was provided without a valid sourceUrl and platform, so sample data was returned instead."
        ),
        SKIPPED,
        SKIPPED
      ),
    });
  }

  // --- Branch C: pageText + sourceUrl + platform all present — attempt live Spyglass. ---

  const spyglassPrompt = buildSpyglassPrompt({ sourceUrl, platform, pageText });
  const spyglassCall = await generateJsonContent(spyglassPrompt);

  if (!spyglassCall.success) {
    return respond({
      ...sampleAnalysis,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      meta: buildMeta(
        "live",
        fallback(`Spyglass: Gemini call failed: ${spyglassCall.message}`),
        SKIPPED,
        SKIPPED
      ),
    });
  }

  const spyglassParsed = parseAiJson(spyglassCall.text, SpyglassResultSchema);

  if (!spyglassParsed.success) {
    const reason =
      spyglassParsed.error.stage === "json_parse"
        ? `Spyglass: Gemini response was not valid JSON: ${spyglassParsed.error.message}`
        : `Spyglass: Gemini response did not match the expected shape: ${spyglassParsed.error.message}`;
    return respond({
      ...sampleAnalysis,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      meta: buildMeta("live", fallback(reason), SKIPPED, SKIPPED),
    });
  }

  // Spyglass succeeded — proceed to live ad generation.
  const liveSpyglass: SpyglassResult = spyglassParsed.data;

  const adPrompt = buildAdGenerationPrompt({ spyglass: liveSpyglass, platform });
  const adCall = await generateJsonContent(adPrompt);

  if (!adCall.success) {
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      spyglass: liveSpyglass,
      ads: sampleAnalysis.ads,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta(
        "live",
        LIVE,
        fallback(`Ad generation: Gemini call failed: ${adCall.message}`),
        SKIPPED
      ),
    });
  }

  const adsParsed = parseAiJson(adCall.text, AdVariationListSchema);

  if (!adsParsed.success) {
    const reason =
      adsParsed.error.stage === "json_parse"
        ? `Ad generation: Gemini response was not valid JSON: ${adsParsed.error.message}`
        : `Ad generation: ${describeAdListIssue(adCall.text)}`;
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      spyglass: liveSpyglass,
      ads: sampleAnalysis.ads,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta("live", LIVE, fallback(reason), SKIPPED),
    });
  }

  // Spyglass and ad generation both succeeded live — proceed to live Shield review.
  const liveAds: AdVariationList = adsParsed.data;

  const shieldPrompt = buildShieldReviewPrompt({ ads: liveAds, platform });
  const shieldCall = await generateJsonContent(shieldPrompt);

  if (!shieldCall.success) {
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      spyglass: liveSpyglass,
      ads: liveAds,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta(
        "live",
        LIVE,
        LIVE,
        fallback(`Shield: Gemini call failed: ${shieldCall.message}`)
      ),
    });
  }

  const shieldParsed = parseAiJson(shieldCall.text, ShieldReviewSchema);

  if (!shieldParsed.success) {
    const reason =
      shieldParsed.error.stage === "json_parse"
        ? `Shield: Gemini response was not valid JSON: ${shieldParsed.error.message}`
        : `Shield: Gemini response did not match the expected shape: ${shieldParsed.error.message}`;
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      spyglass: liveSpyglass,
      ads: liveAds,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta("live", LIVE, LIVE, fallback(reason)),
    });
  }

  // Shield's shape is valid — now check it actually reviewed the right ads
  // with phrases that really appear in them (see shield-validation.ts).
  const liveShield: ShieldReview = shieldParsed.data;
  const coverage = validateShieldReview(liveShield, liveAds);

  if (!coverage.valid) {
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl,
      platform,
      spyglass: liveSpyglass,
      ads: liveAds,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta("live", LIVE, LIVE, fallback(`Shield: ${coverage.reason}`)),
    });
  }

  // Spyglass, ad generation, and Shield review all succeeded live.
  return respond({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    sourceUrl,
    platform,
    spyglass: liveSpyglass,
    ads: liveAds,
    shield: liveShield,
    kpi: sampleAnalysis.kpi,
    meta: buildMeta("live", LIVE, LIVE, LIVE),
  });
}