import type { AegisAnalysisResult } from "./types";

export const sampleAnalysis: AegisAnalysisResult = {
  id: "sample-001",
  createdAt: "2026-06-25T09:00:00.000Z",
  sourceUrl: "https://competitor.com/products/fat-burner-pro",
  platform: "meta",

  spyglass: {
    sourceUrl: "https://competitor.com/products/fat-burner-pro",
    platform: "meta",
    offerSummary:
      "Thermogenic fat burner supplement marketed for rapid fat loss and all-day energy.",
    positioningSummary:
      "Sells speed and effortlessness as the core promise, leaning on urgency over substantiated mechanism.",
    targetAudience: "Adults 25-45, health-conscious, weight loss goals",
    hooks: ["Lose weight fast", "Melt stubborn fat"],
    emotionalTriggers: ["Confidence", "Transformation", "Urgency"],
    claims: ["Burns fat 24/7", "No diet needed", "Doctor recommended"],
    painPoints: ["Slow metabolism", "Failed diets", "Low energy"],
    ctas: ["Order Now", "Get Your Bottle", "Claim Offer"],
    creativeOpportunities: [
      "Reframe the speed claim around fitting into an existing routine",
      "Replace authority claims with ingredient-level substantiation",
    ],
  },

  ads: [
    {
      id: "ad-1",
      platform: "meta",
      angle: "Effortless routine fit",
      hook: "Melt Fat Overnight",
      body: "No diet required—just take and go.",
      cta: "Shop Now",
      reasoning: "Mirrors the competitor's speed-and-ease hook to test against the same audience.",
    },
    {
      id: "ad-2",
      platform: "google",
      angle: "Ingredient authority",
      hook: "24/7 Fat Burning, Doctor Recommended",
      body: "Clinically studied ingredients designed to help your body burn more fat, even at rest.",
      cta: "Learn More",
      reasoning: "Tests a credibility-led angle instead of a pure speed claim.",
    },
    {
      id: "ad-3",
      platform: "tiktok",
      angle: "Social proof momentum",
      hook: "Lose 10 Pounds This Week",
      body: "Thousands are already seeing results. Are you next?",
      cta: "Get Yours Now",
      reasoning: "Leans on social proof and a concrete number, common in high-performing TikTok ad copy.",
    },
    {
      id: "ad-4",
      platform: "taboola",
      angle: "Curiosity-driven native ad",
      hook: "Guaranteed Results In Days",
      body: "This one simple trick is changing everything for thousands of people.",
      cta: "Read More",
      reasoning: "Native-style curiosity hook suited to Taboola's content-feed placement.",
    },
    {
      id: "ad-5",
      platform: "general",
      angle: "Routine-first positioning",
      hook: "Support Your Goals, One Step at a Time",
      body: "Backed by ingredients studied for fat metabolism support, designed to fit into your daily routine.",
      cta: "Try It Today",
      reasoning: "A platform-agnostic baseline ad with no risky language, useful as a control variant.",
    },
  ],

  shield: {
    totalRisksChecked: 8,
    saferAdsDelivered: 5,
    reviewedAds: [
      {
        adVariationId: "ad-1",
        overallRiskLevel: "high",
        findings: [
          {
            id: "finding-1a",
            adVariationId: "ad-1",
            riskLevel: "high",
            riskCategory: "misleading_claim",
            flaggedPhrase: "Melt Fat Overnight",
            riskReason: "Implausible speed claim; commonly rejected on Meta and Google.",
            suggestedRewrite: "Support Fat Loss While You Sleep",
            status: "rewritten",
          },
          {
            id: "finding-1b",
            adVariationId: "ad-1",
            riskLevel: "medium",
            riskCategory: "misleading_claim",
            flaggedPhrase: "No diet required",
            riskReason: "Implies the product fully replaces healthy habits.",
            suggestedRewrite: "Works with your healthy routine",
            status: "rewritten",
          },
        ],
        finalCompliantVersion:
          "Support Fat Loss While You Sleep. Works with your healthy routine—just take and go.",
      },
      {
        adVariationId: "ad-2",
        overallRiskLevel: "high",
        findings: [
          {
            id: "finding-2a",
            adVariationId: "ad-2",
            riskLevel: "high",
            riskCategory: "substantiation_required",
            flaggedPhrase: "Doctor Recommended",
            riskReason: "Credential claim with no substantiation on file.",
            suggestedRewrite: "Formulated With Research-Backed Ingredients",
            status: "rewritten",
          },
          {
            id: "finding-2b",
            adVariationId: "ad-2",
            riskLevel: "medium",
            riskCategory: "unsupported_superlative",
            flaggedPhrase: "24/7 Fat Burning",
            riskReason: "Absolute, unverifiable physiological claim.",
            suggestedRewrite: "Supports Fat Burning Throughout the Day",
            status: "rewritten",
          },
        ],
        finalCompliantVersion:
          "Supports Fat Burning Throughout the Day, Formulated With Research-Backed Ingredients. Clinically studied ingredients designed to help your body burn more fat, even at rest.",
      },
      {
        adVariationId: "ad-3",
        overallRiskLevel: "high",
        findings: [
          {
            id: "finding-3a",
            adVariationId: "ad-3",
            riskLevel: "high",
            riskCategory: "before_after_claim",
            flaggedPhrase: "Lose 10 Pounds This Week",
            riskReason: "Specific, timeboxed transformation claim with no individual results disclaimer.",
            suggestedRewrite: "Real Progress Starts With Real Habits",
            status: "rewritten",
          },
          {
            id: "finding-3b",
            adVariationId: "ad-3",
            riskLevel: "low",
            riskCategory: "aggressive_urgency",
            flaggedPhrase: "Are you next?",
            riskReason: "Mild urgency framing; generally tolerated but softened in the final version.",
            suggestedRewrite: "See what consistency looks like.",
            status: "rewritten",
          },
        ],
        finalCompliantVersion:
          "Real Progress Starts With Real Habits. Thousands are already seeing results. See what consistency looks like.",
      },
      {
        adVariationId: "ad-4",
        overallRiskLevel: "high",
        findings: [
          {
            id: "finding-4a",
            adVariationId: "ad-4",
            riskLevel: "high",
            riskCategory: "guaranteed_outcome",
            flaggedPhrase: "Guaranteed Results In Days",
            riskReason: "Outcome guarantee paired with a specific timeframe; high platform rejection risk.",
            suggestedRewrite: "Visible Progress When Paired With Consistency",
            status: "rewritten",
          },
          {
            id: "finding-4b",
            adVariationId: "ad-4",
            riskLevel: "medium",
            riskCategory: "unsupported_superlative",
            flaggedPhrase: "This one simple trick",
            riskReason: "Clickbait framing inconsistent with platform-sensitive native ad policies.",
            suggestedRewrite: "This approach is helping thousands build a routine that works.",
            status: "rewritten",
          },
        ],
        finalCompliantVersion:
          "Visible Progress When Paired With Consistency. This approach is helping thousands build a routine that works.",
      },
      {
        adVariationId: "ad-5",
        overallRiskLevel: "none",
        findings: [],
        finalCompliantVersion:
          "Support Your Goals, One Step at a Time. Backed by ingredients studied for fat metabolism support, designed to fit into your daily routine.",
      },
    ],
  },

  kpi: {
    anglesFound: 6,
    risksChecked: 8,
    saferAdsDelivered: 5,
    pipelineHealth: 88,
  },
};