import { z } from "zod";
import {
  PlatformSchema,
  RiskLevelSchema,
  ShieldStatusSchema,
  RiskCategorySchema,
  SpyglassResultSchema,
  AdVariationSchema,
  AdVariationListSchema,
  ShieldFindingSchema,
  ShieldReviewedAdSchema,
  ShieldReviewSchema,
  KpiSummarySchema,
  StageSourceSchema,
  StageStatusSchema,
  AnalysisMetaSchema,
  AegisAnalysisResultSchema,
} from "./schemas";

export type Platform = z.infer<typeof PlatformSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type ShieldStatus = z.infer<typeof ShieldStatusSchema>;
export type RiskCategory = z.infer<typeof RiskCategorySchema>;
export type SpyglassResult = z.infer<typeof SpyglassResultSchema>;
export type AdVariation = z.infer<typeof AdVariationSchema>;
export type AdVariationList = z.infer<typeof AdVariationListSchema>;
export type ShieldFinding = z.infer<typeof ShieldFindingSchema>;
export type ShieldReviewedAd = z.infer<typeof ShieldReviewedAdSchema>;
export type ShieldReview = z.infer<typeof ShieldReviewSchema>;
export type KpiSummary = z.infer<typeof KpiSummarySchema>;
export type StageSource = z.infer<typeof StageSourceSchema>;
export type StageStatus = z.infer<typeof StageStatusSchema>;
export type AnalysisMeta = z.infer<typeof AnalysisMetaSchema>;
export type AegisAnalysisResult = z.infer<typeof AegisAnalysisResultSchema>;

// UI-only state for sidebar navigation / scroll tracking — not part of the
// Aegis data model, so it isn't backed by a Zod schema.
export type SectionId = "dashboard" | "spyglass" | "shield" | "projects" | "reports" | "settings";