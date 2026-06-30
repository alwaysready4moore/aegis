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

export const AegisAnalysisResultSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  sourceUrl: z.string().url(),
  platform: PlatformSchema,
  spyglass: SpyglassResultSchema,
  ads: z.array(AdVariationSchema),
  shield: ShieldReviewSchema,
  kpi: KpiSummarySchema,
});