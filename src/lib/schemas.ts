import { z } from "zod";

export const PlatformSchema = z.enum(["meta", "google", "tiktok", "taboola", "general"]);

export const RiskLevelSchema = z.enum(["high", "medium", "low", "none"]);

export const ShieldStatusSchema = z.enum(["rewritten", "acceptable"]);

export const RiskCategorySchema = z.enum([
  "misleading_claim",
  "unsupported_superlative",
  "aggressive_urgency",
  "health_or_medical_claim",
  "financial_promise",
  "guaranteed_outcome",
  "personal_attribute_targeting",
  "before_after_claim",
  "fear_based_hook",
  "platform_sensitive_wording",
  "substantiation_required",
]);

export const SpyglassResultSchema = z.object({
  sourceUrl: z.string().url(),
  platform: PlatformSchema,
  offerSummary: z.string(),
  positioningSummary: z.string(),
  targetAudience: z.string(),
  hooks: z.array(z.string()),
  emotionalTriggers: z.array(z.string()),
  claims: z.array(z.string()),
  painPoints: z.array(z.string()),
  ctas: z.array(z.string()),
  creativeOpportunities: z.array(z.string()),
});

export const AdVariationSchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  angle: z.string(),
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  reasoning: z.string(),
});

// The contest MVP promises exactly 5 generated ad variations, and the
// dashboard's Generated Ads section is built around that count. Enforcing
// it here means a Gemini response with 3 or 7 ads is treated the same as
// any other malformed response: a schema validation failure that falls back
// to sampleAnalysis.ads, rather than something the UI has to handle as a
// variable-length case.
export const AdVariationListSchema = z.array(AdVariationSchema).length(5);

export const ShieldFindingSchema = z.object({
  id: z.string(),
  adVariationId: z.string(),
  riskLevel: RiskLevelSchema,
  riskCategory: RiskCategorySchema,
  flaggedPhrase: z.string(),
  riskReason: z.string(),
  suggestedRewrite: z.string(),
  status: ShieldStatusSchema,
});

export const ShieldReviewedAdSchema = z.object({
  adVariationId: z.string(),
  overallRiskLevel: RiskLevelSchema,
  findings: z.array(ShieldFindingSchema),
  finalCompliantVersion: z.string(),
});

export const ShieldReviewSchema = z.object({
  reviewedAds: z.array(ShieldReviewedAdSchema),
  totalRisksChecked: z.number(),
  saferAdsDelivered: z.number(),
});

export const KpiSummarySchema = z.object({
  anglesFound: z.number(),
  risksChecked: z.number(),
  saferAdsDelivered: z.number(),
  pipelineHealth: z.number(),
});

// Per-stage status for one pipeline step (Spyglass, ad generation, or
// Shield). "skipped" covers both pure sample mode (nothing was attempted)
// and stages that come after one that already fell back (e.g. ad generation
// is "skipped" when Spyglass itself failed, since we never call Gemini for
// ads in that case).
export const StageSourceSchema = z.enum(["live", "fallback", "skipped"]);

export const StageStatusSchema = z.object({
  source: StageSourceSchema,
  fallbackReason: z.string().optional(),
});

// Page-text extraction has one more distinct state than the other stages:
// text can come from the person typing it in manually, from a live
// Firecrawl scrape, be skipped entirely (pure sample mode), or fall back to
// sample data because a live attempt failed. "live"/"fallback"/"skipped"
// alone can't express "manual" vs "firecrawl" as two different live paths,
// so extraction gets its own small schema rather than reusing StageSourceSchema.
export const ExtractionSourceSchema = z.enum(["manual", "firecrawl", "skipped", "fallback"]);

export const ExtractionStatusSchema = z.object({
  source: ExtractionSourceSchema,
  fallbackReason: z.string().optional(),
});

// Reports whether a result came from the sample fixture or a live Gemini
// call, and why a fallback happened if it did.
//
// `source`, `usedFallback`, and `fallbackReason` are the original Stage 3a
// fields, kept with their original meaning so the existing dashboard notice
// ("Aegis used sample fallback: ...") keeps working unmodified — it reads
// `usedFallback` and `fallbackReason` as a rollup across the whole pipeline.
//
// `stages` is the additive piece: a per-stage breakdown so the underlying
// data (and any future UI) can tell "extraction was live but Spyglass
// failed" apart from "everything fell back". Optional so any older result
// without it still validates.
export const AnalysisMetaSchema = z.object({
  source: z.enum(["sample", "live"]),
  usedFallback: z.boolean(),
  fallbackReason: z.string().optional(),
  stages: z
    .object({
      extraction: ExtractionStatusSchema,
      spyglass: StageStatusSchema,
      ads: StageStatusSchema,
      shield: StageStatusSchema,
    })
    .optional(),
});

export const AegisAnalysisResultSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  sourceUrl: z.string().url(),
  platform: PlatformSchema,
  spyglass: SpyglassResultSchema,
  ads: z.array(AdVariationSchema),
  shield: ShieldReviewSchema,
  kpi: KpiSummarySchema,
  meta: AnalysisMetaSchema.optional(),
});