import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  AegisAnalysisResultSchema,
  AnalyzeRequestSchema,
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
import { DEFAULT_MAX_EXTRACTED_CHARS, scrapeUrlToText, truncateText } from "@/lib/firecrawl";
import { validateShieldReview } from "@/lib/shield-validation";
import type {
  AegisAnalysisResult,
  AnalysisMeta,
  StageStatus,
  ExtractionStatus,
  Platform,
  SpyglassResult,
  AdVariationList,
  ShieldReview,
} from "@/lib/types";

const SKIPPED: StageStatus = { source: "skipped" };
const LIVE: StageStatus = { source: "live" };

const EXTRACTION_SKIPPED: ExtractionStatus = { source: "skipped" };
const EXTRACTION_MANUAL: ExtractionStatus = { source: "manual" };
const EXTRACTION_FIRECRAWL: ExtractionStatus = { source: "firecrawl" };

function fallback(reason: string): StageStatus {
  return { source: "fallback", fallbackReason: reason };
}

function extractionFallback(reason: string): ExtractionStatus {
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
 * `usedFallback`/`fallbackReason` are a rollup across all four stages,
 * computed here so the existing dashboard notice (which reads only those
 * two fields) keeps working without any UI changes.
 */
function buildMeta(
  overallSource: "sample" | "live",
  extraction: ExtractionStatus,
  spyglass: StageStatus,
  ads: StageStatus,
  shield: StageStatus
): AnalysisMeta {
  const stages = [extraction, spyglass, ads, shield];
  const fallbackStage = stages.find((s) => s.source === "fallback");
  return {
    source: overallSource,
    usedFallback: Boolean(fallbackStage),
    ...(fallbackStage?.fallbackReason ? { fallbackReason: fallbackStage.fallbackReason } : {}),
    stages: { extraction, spyglass, ads, shield },
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
  const rawBody = await request.text();

  // A bodyless POST is the explicit sample-analysis path used by the UI.
  if (!rawBody.trim()) {
    return respond({
      ...sampleAnalysis,
      meta: buildMeta("sample", EXTRACTION_SKIPPED, SKIPPED, SKIPPED, SKIPPED),
    });
  }

  let rawInput: unknown;
  try {
    rawInput = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", message: "Send valid JSON, or use a bodyless POST for sample mode." },
      { status: 400 }
    );
  }

  const parsedInput = AnalyzeRequestSchema.safeParse(rawInput);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "Invalid analysis request.",
        details: parsedInput.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { sourceUrl, platform: targetPlatform, pageText } = parsedInput.data;
  const targetUrl = sourceUrl ?? null;
  const sourceInputMode = pageText ? "manual" : "url";

  // --- Resolve the page text: manual text takes priority; otherwise scrape it. ---
  let resolvedPageText: string;
  let extractionStatus: ExtractionStatus;

  if (pageText) {
    const wasTruncated = pageText.length > DEFAULT_MAX_EXTRACTED_CHARS;
    resolvedPageText = truncateText(pageText);
    extractionStatus = {
      source: "manual",
      ...(wasTruncated
        ? {
            note: `Manual page text was truncated to ${DEFAULT_MAX_EXTRACTED_CHARS.toLocaleString()} characters before analysis.`,
          }
        : {}),
    };
  } else {
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Invalid analysis request.", message: "Provide a valid URL or paste manual page text." },
        { status: 400 }
      );
    }

    const scrapeResult = await scrapeUrlToText(targetUrl);

    if (!scrapeResult.success) {
      return respond({
        ...sampleAnalysis,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        sourceUrl: targetUrl,
        sourceInputMode,
        platform: targetPlatform,
        meta: buildMeta(
          "live",
          extractionFallback(`Firecrawl: ${scrapeResult.message}`),
          fallback("Sample Spyglass shown because page extraction did not complete."),
          fallback("Sample ads shown because page extraction did not complete."),
          fallback("Sample Shield review shown because page extraction did not complete.")
        ),
      });
    }

    resolvedPageText = truncateText(scrapeResult.text);
    extractionStatus = EXTRACTION_FIRECRAWL;
  }

  // --- From here on, the pipeline is unchanged from Stage 3d: Spyglass -> ads -> Shield. ---

  const spyglassPrompt = buildSpyglassPrompt({
    sourceUrl: targetUrl,
    platform: targetPlatform,
    pageText: resolvedPageText,
  });
  const spyglassCall = await generateJsonContent(spyglassPrompt);

  if (!spyglassCall.success) {
    return respond({
      ...sampleAnalysis,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      meta: buildMeta(
        "live",
        extractionStatus,
        fallback(`Spyglass: Gemini call failed: ${spyglassCall.message}`),
        fallback("Sample ads shown because Spyglass did not complete."),
        fallback("Sample Shield review shown because Spyglass did not complete.")
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
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      meta: buildMeta(
        "live",
        extractionStatus,
        fallback(reason),
        fallback("Sample ads shown because Spyglass did not complete."),
        fallback("Sample Shield review shown because Spyglass did not complete.")
      ),
    });
  }

  // Spyglass succeeded — proceed to live ad generation.
  const liveSpyglass: SpyglassResult = spyglassParsed.data;

  const adPrompt = buildAdGenerationPrompt({ spyglass: liveSpyglass, platform: targetPlatform });
  const adCall = await generateJsonContent(adPrompt);

  if (!adCall.success) {
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      spyglass: liveSpyglass,
      ads: sampleAnalysis.ads,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta(
        "live",
        extractionStatus,
        LIVE,
        fallback(`Ad generation: Gemini call failed: ${adCall.message}`),
        fallback("Sample Shield review shown because live ad generation did not complete.")
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
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      spyglass: liveSpyglass,
      ads: sampleAnalysis.ads,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta(
        "live",
        extractionStatus,
        LIVE,
        fallback(reason),
        fallback("Sample Shield review shown because live ad generation did not complete.")
      ),
    });
  }

  // Spyglass and ad generation both succeeded live — proceed to live Shield review.
  const liveAds: AdVariationList = adsParsed.data;

  const shieldPrompt = buildShieldReviewPrompt({ ads: liveAds, platform: targetPlatform });
  const shieldCall = await generateJsonContent(shieldPrompt);

  if (!shieldCall.success) {
    return respond({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      spyglass: liveSpyglass,
      ads: liveAds,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta(
        "live",
        extractionStatus,
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
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      spyglass: liveSpyglass,
      ads: liveAds,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta("live", extractionStatus, LIVE, LIVE, fallback(reason)),
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
      sourceUrl: targetUrl,
      sourceInputMode,
      platform: targetPlatform,
      spyglass: liveSpyglass,
      ads: liveAds,
      shield: sampleAnalysis.shield,
      kpi: sampleAnalysis.kpi,
      meta: buildMeta("live", extractionStatus, LIVE, LIVE, fallback(`Shield: ${coverage.reason}`)),
    });
  }

  // Extraction, Spyglass, ad generation, and Shield review all succeeded live.
  return respond({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    sourceUrl: targetUrl,
    sourceInputMode,
    platform: targetPlatform,
    spyglass: liveSpyglass,
    ads: liveAds,
    shield: liveShield,
    kpi: sampleAnalysis.kpi,
    meta: buildMeta("live", extractionStatus, LIVE, LIVE, LIVE),
  });
}