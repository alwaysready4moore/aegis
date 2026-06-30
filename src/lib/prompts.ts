import type { Platform, SpyglassResult, AdVariation } from "./types";
import { formatPolicyRulesForPrompt, POLICY_DISCLAIMER } from "./policy-rules";

// Shared instruction appended to every prompt. Gemini's JSON mode still
// occasionally wraps output in markdown fences or adds a sentence of
// preamble — this is the first line of defense before parseAiJson() in
// ai-parsing.ts strips fences as a second line of defense.
const JSON_ONLY_INSTRUCTION = `
Respond with raw JSON only. Do not include markdown code fences, comments, explanations, or any text before or after the JSON — no preamble like "Here is the JSON:" and no closing remarks. The entire response body must be valid JSON that can be parsed directly with JSON.parse().
`.trim();

// ---------------------------------------------------------------------------
// Spyglass: page analysis
// ---------------------------------------------------------------------------

export interface SpyglassPromptInput {
  sourceUrl: string;
  platform: Platform;
  /** Raw extracted text from the competitor page (Firecrawl output, Stage 4). */
  pageText: string;
}

export function buildSpyglassPrompt(input: SpyglassPromptInput): string {
  const { sourceUrl, platform, pageText } = input;

  return `
You are Spyglass, the page-analysis engine inside Aegis, a creative intelligence tool for media buyers.

Read the competitor landing page text below and extract the page's creative intelligence. Ground every field strictly in what the page text actually says — do not invent claims, audiences, or hooks that are not supported by the text.

Source URL: ${sourceUrl}
Target platform for downstream ad generation: ${platform}

Page text:
"""
${pageText}
"""

Return a single JSON object with exactly these fields:

{
  "sourceUrl": string,            // echo back the source URL exactly as given above
  "platform": string,             // echo back the platform exactly as given above
  "offerSummary": string,         // 1-2 sentences: what is being sold and its core mechanism
  "positioningSummary": string,   // 1 sentence: the strategic angle the page is leaning on (e.g. speed, authority, social proof)
  "targetAudience": string,       // who the page is written for, based on tone and content
  "hooks": string[],              // short hook phrases the page itself uses or implies
  "emotionalTriggers": string[],  // emotions the copy is leaning on (e.g. "Urgency", "Confidence")
  "claims": string[],             // specific claims made on the page, quoted or closely paraphrased
  "painPoints": string[],         // problems the page implies the reader has
  "ctas": string[],               // call-to-action phrases used on the page
  "creativeOpportunities": string[] // 2-4 short suggestions for a safer or more differentiated angle
}

${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------------------------------------------------------------------------
// Ad generation
// ---------------------------------------------------------------------------

export interface AdGenerationPromptInput {
  spyglass: SpyglassResult;
  platform: Platform;
  /** Number of ad variations to generate. Stage 1 sample data uses 5. */
  variationCount?: number;
  /**
   * If true, vary the `platform` field across the generated ads (mirrors the
   * Stage 1 sample fixture). If false, every ad uses `platform` above.
   * Defaults to false — most real runs will be for one target platform.
   */
  diversifyPlatforms?: boolean;
}

export function buildAdGenerationPrompt(input: AdGenerationPromptInput): string {
  const { spyglass, platform, variationCount = 5, diversifyPlatforms = false } = input;

  return `
You are the ad generation engine inside Aegis, a creative intelligence tool for media buyers. You take Spyglass's page analysis and turn it into testable ad variations.

Spyglass analysis (JSON):
${JSON.stringify(spyglass, null, 2)}

Requested platform: ${platform}
Number of ad variations to generate: ${variationCount}
Platform assignment: ${
    diversifyPlatforms
      ? "Vary the platform field across the generated ads to give a cross-platform spread."
      : `Use "${platform}" as the platform field for every generated ad.`
  }

Each ad variation should test a distinct angle drawn from the Spyglass analysis (e.g. one ad per hook, one leaning on social proof, one leaning on ingredient/authority credibility, one as a clean platform-agnostic baseline). Do not simply restate the competitor's claims verbatim — generate this advertiser's own ad copy, informed by the same offer and audience.

Return a JSON array of exactly ${variationCount} objects, each matching this shape:

{
  "id": string,            // a short unique id, e.g. "ad-1", "ad-2"
  "platform": string,      // one of: meta, google, tiktok, taboola, general
  "angle": string,         // short label for the creative angle, e.g. "Ingredient authority"
  "hook": string,          // the headline / opening line
  "body": string,          // 1-2 sentences of supporting copy
  "cta": string,           // short call-to-action label
  "reasoning": string      // 1 sentence: why this angle could work, written for a media buyer
}

${JSON_ONLY_INSTRUCTION}
`.trim();
}

// ---------------------------------------------------------------------------
// Shield: risk review
// ---------------------------------------------------------------------------

export interface ShieldReviewPromptInput {
  ads: AdVariation[];
  platform: Platform;
}

export function buildShieldReviewPrompt(input: ShieldReviewPromptInput): string {
  const { ads, platform } = input;

  return `
You are Shield, the compliance-risk review engine inside Aegis, a creative intelligence tool for media buyers. You review generated ad copy for language likely to be flagged by ad platform policy systems, and you propose safer rewrites.

${POLICY_DISCLAIMER}

Risk categories and what they mean:
${formatPolicyRulesForPrompt()}

Target platform: ${platform}

Ad variations to review (JSON):
${JSON.stringify(ads, null, 2)}

Rules for this review:
1. Only flag a phrase if it appears verbatim (or as a very close substring) inside that specific ad's hook, body, or cta. Do not flag language from any other source.
2. Every ad must be reviewed, including ads with no risky language — those get an empty findings array and overallRiskLevel "none".
3. Each finding needs exactly one riskCategory from the list above.
4. "status" is "rewritten" if finalCompliantVersion uses the suggestedRewrite in place of the flaggedPhrase; "acceptable" only applies to a finding that is noted but deliberately left unchanged in finalCompliantVersion.
5. "overallRiskLevel" for an ad is the highest riskLevel among its findings ("none" if there are no findings).
6. "finalCompliantVersion" is the full rewritten ad copy (hook + body + cta merged into readable ad text) with every "rewritten" finding's suggestedRewrite applied.

Return a single JSON object matching this shape:

{
  "reviewedAds": [
    {
      "adVariationId": string,       // must match an "id" from the ads array above
      "overallRiskLevel": string,    // one of: high, medium, low, none
      "findings": [
        {
          "id": string,              // short unique id, e.g. "finding-1a"
          "adVariationId": string,   // same id as the parent reviewedAd
          "riskLevel": string,       // one of: high, medium, low, none
          "riskCategory": string,    // one of the category keys listed above
          "flaggedPhrase": string,   // must appear verbatim in the ad's hook/body/cta
          "riskReason": string,      // 1 sentence explaining the risk
          "suggestedRewrite": string,
          "status": string           // one of: rewritten, acceptable
        }
      ],
      "finalCompliantVersion": string
    }
  ],
  "totalRisksChecked": number,     // total number of findings across all ads
  "saferAdsDelivered": number      // number of ads with a finalCompliantVersion ready to use (usually ads.length)
}

${JSON_ONLY_INSTRUCTION}
`.trim();
}