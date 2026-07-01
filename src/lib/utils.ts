import { clsx, type ClassValue } from "clsx";
import type { AdVariation, Platform, RiskLevel, RiskCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getAdById(ads: AdVariation[], id: string): AdVariation | undefined {
  return ads.find((ad) => ad.id === id);
}

export const platformLabels: Record<Platform, string> = {
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok",
  taboola: "Taboola",
  general: "General",
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

export const riskCategoryLabels: Record<RiskCategory, string> = {
  misleading_claim: "Misleading claim",
  unsupported_superlative: "Unsupported superlative",
  aggressive_urgency: "Aggressive urgency",
  health_or_medical_claim: "Health or medical claim",
  financial_promise: "Financial promise",
  guaranteed_outcome: "Guaranteed outcome",
  personal_attribute_targeting: "Personal attribute targeting",
  before_after_claim: "Before/after claim",
  fear_based_hook: "Fear-based hook",
  platform_sensitive_wording: "Platform-sensitive wording",
  substantiation_required: "Substantiation required",
  intellectual_property_risk: "Intellectual property risk",
};