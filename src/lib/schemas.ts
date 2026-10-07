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
  "intellectual_property_risk",
]);

const optionalTrimmedUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().url().optional()
);

const optionalTrimmedText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().max(50_000, "Manual page text is too large to process.").optional()
);

/**
 * API-boundary schema for live analysis requests.
 * A live request needs a supported platform plus either a valid URL or manual text.
 * Manual text may be used without a URL.
 */
export const AnalyzeRequestSchema = z
  .object({
    sourceUrl: optionalTrimmedUrl,
    platform: PlatformSchema,
    pageText: optionalTrimmedText,
  })
  .superRefine((value, ctx) => {
    if (!value.sourceUrl && !value.pageText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceUrl"],
        message: "Provide a valid competitor URL or paste manual page text.",
      });
    }
  });

export const SpyglassResultSchema = z.object({
  sourceUrl: z.string().url().nullable(),
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

export const StageSourceSchema = z.enum(["live", "fallback", "skipped"]);

export const StageStatusSchema = z.object({
  source: StageSourceSchema,
  fallbackReason: z.string().optional(),
});

export const ExtractionSourceSchema = z.enum(["manual", "firecrawl", "skipped", "fallback"]);

export const ExtractionStatusSchema = z.object({
  source: ExtractionSourceSchema,
  fallbackReason: z.string().optional(),
  note: z.string().optional(),
});

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

export const SourceInputModeSchema = z.enum(["url", "manual", "sample"]);

export const AegisAnalysisResultSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  sourceUrl: z.string().url().nullable(),
  sourceInputMode: SourceInputModeSchema,
  platform: PlatformSchema,
  spyglass: SpyglassResultSchema,
  ads: z.array(AdVariationSchema),
  shield: ShieldReviewSchema,
  kpi: KpiSummarySchema,
  meta: AnalysisMetaSchema.optional(),
});
