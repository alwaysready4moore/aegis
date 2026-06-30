import { z } from "zod";
import {
  PlatformSchema,
  RiskLevelSchema,
  ShieldStatusSchema,
  RiskCategorySchema,
  SpyglassResultSchema,
  AdVariationSchema,
  ShieldFindingSchema,
  ShieldReviewedAdSchema,
  ShieldReviewSchema,
  KpiSummarySchema,
  AegisAnalysisResultSchema,
} from "./schemas";

export type Platform = z.infer<typeof PlatformSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type ShieldStatus = z.infer<typeof ShieldStatusSchema>;
export type RiskCategory = z.infer<typeof RiskCategorySchema>;
export type SpyglassResult = z.infer<typeof SpyglassResultSchema>;
export type AdVariation = z.infer<typeof AdVariationSchema>;
export type ShieldFinding = z.infer<typeof ShieldFindingSchema>;
export type ShieldReviewedAd = z.infer<typeof ShieldReviewedAdSchema>;
export type ShieldReview = z.infer<typeof ShieldReviewSchema>;
export type KpiSummary = z.infer<typeof KpiSummarySchema>;
export type AegisAnalysisResult = z.infer<typeof AegisAnalysisResultSchema>;