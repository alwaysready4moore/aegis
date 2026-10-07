import type { ShieldReview, AdVariation, RiskLevel } from "./types";

export type ShieldValidationResult = { valid: true } | { valid: false; reason: string };

const RISK_RANK: Record<RiskLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

function highestRiskLevel(levels: RiskLevel[]): RiskLevel {
  if (levels.length === 0) return "none";
  return levels.reduce<RiskLevel>(
    (highest, level) => (RISK_RANK[level] > RISK_RANK[highest] ? level : highest),
    "none"
  );
}

function normalized(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Cross-object trust gate for Shield.
 *
 * Schema validation proves the response has the right shape. This validator
 * proves that the response is internally consistent with the ads Aegis
 * actually generated before any Shield output is displayed as trustworthy.
 */
export function validateShieldReview(
  shieldReview: ShieldReview,
  ads: AdVariation[]
): ShieldValidationResult {
  const adIds = ads.map((ad) => ad.id);
  const reviewedIds = shieldReview.reviewedAds.map((review) => review.adVariationId);

  if (new Set(adIds).size !== adIds.length) {
    return { valid: false, reason: "Generated ads contain duplicate IDs." };
  }

  if (new Set(reviewedIds).size !== reviewedIds.length) {
    return { valid: false, reason: "Shield returned duplicate reviewed-ad IDs." };
  }

  if (reviewedIds.length !== adIds.length) {
    return {
      valid: false,
      reason: `Shield reviewed ${reviewedIds.length} ads instead of the expected ${adIds.length}.`,
    };
  }

  const adIdSet = new Set(adIds);
  const reviewedIdSet = new Set(reviewedIds);
  const missing = adIds.filter((id) => !reviewedIdSet.has(id));
  const unexpected = reviewedIds.filter((id) => !adIdSet.has(id));

  if (missing.length > 0 || unexpected.length > 0) {
    return {
      valid: false,
      reason: `Shield review did not cover the exact set of generated ads (missing: ${
        missing.join(", ") || "none"
      }; unexpected: ${unexpected.join(", ") || "none"}).`,
    };
  }

  const adsById = new Map(ads.map((ad) => [ad.id, ad]));
  const findingIds = new Set<string>();
  let derivedRiskCount = 0;
  let derivedSaferAds = 0;

  for (const reviewedAd of shieldReview.reviewedAds) {
    const ad = adsById.get(reviewedAd.adVariationId);
    if (!ad) continue;

    const adText = normalized(`${ad.hook} ${ad.body} ${ad.cta}`);
    const finalText = normalized(reviewedAd.finalCompliantVersion);

    if (!finalText) {
      return {
        valid: false,
        reason: `Ad "${ad.id}" has an empty finalCompliantVersion.`,
      };
    }

    derivedSaferAds += 1;
    derivedRiskCount += reviewedAd.findings.length;

    for (const finding of reviewedAd.findings) {
      if (findingIds.has(finding.id)) {
        return { valid: false, reason: `Shield returned duplicate finding id "${finding.id}".` };
      }
      findingIds.add(finding.id);

      if (finding.adVariationId !== reviewedAd.adVariationId) {
        return {
          valid: false,
          reason: `Finding "${finding.id}" points to ad "${finding.adVariationId}" instead of its parent ad "${reviewedAd.adVariationId}".`,
        };
      }

      const flaggedPhrase = normalized(finding.flaggedPhrase);
      const suggestedRewrite = normalized(finding.suggestedRewrite);

      if (!flaggedPhrase || !adText.includes(flaggedPhrase)) {
        return {
          valid: false,
          reason: `Shield flagged "${finding.flaggedPhrase}" on ad "${ad.id}", but that phrase does not appear in the ad's hook/body/cta.`,
        };
      }

      if (finding.riskLevel === "none") {
        return {
          valid: false,
          reason: `Finding "${finding.id}" uses riskLevel "none"; findings must identify an actual risk.`,
        };
      }

      if (finding.status === "rewritten") {
        if (finalText.includes(flaggedPhrase)) {
          return {
            valid: false,
            reason: `Finding "${finding.id}" is marked rewritten, but the risky phrase still appears in finalCompliantVersion.`,
          };
        }

        if (!suggestedRewrite || !finalText.includes(suggestedRewrite)) {
          return {
            valid: false,
            reason: `Finding "${finding.id}" is marked rewritten, but its suggested rewrite was not applied in finalCompliantVersion.`,
          };
        }
      }
    }

    const expectedOverallRisk = highestRiskLevel(
      reviewedAd.findings.map((finding) => finding.riskLevel)
    );

    if (reviewedAd.overallRiskLevel !== expectedOverallRisk) {
      return {
        valid: false,
        reason: `Ad "${ad.id}" reports overallRiskLevel "${reviewedAd.overallRiskLevel}" but its findings require "${expectedOverallRisk}".`,
      };
    }
  }

  if (shieldReview.totalRisksChecked !== derivedRiskCount) {
    return {
      valid: false,
      reason: `Shield reports totalRisksChecked=${shieldReview.totalRisksChecked}, but ${derivedRiskCount} findings were actually returned.`,
    };
  }

  if (shieldReview.saferAdsDelivered !== derivedSaferAds) {
    return {
      valid: false,
      reason: `Shield reports saferAdsDelivered=${shieldReview.saferAdsDelivered}, but ${derivedSaferAds} reviewed ads contain final copy.`,
    };
  }

  return { valid: true };
}
