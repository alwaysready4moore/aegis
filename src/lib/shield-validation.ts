import type { ShieldReview, AdVariation } from "./types";

export type ShieldValidationResult = { valid: true } | { valid: false; reason: string };

/**
 * ShieldReviewSchema only validates shape (the right fields, the right
 * types). It can't know whether every generated ad actually got reviewed,
 * or whether a flagged phrase really appears in the ad it's attached to.
 * Those are the two correctness guarantees this product promises — see the
 * "Important Shield behavior" requirements — so they're enforced here as a
 * second gate after schema validation, rather than left to the prompt's
 * instructions alone (which Gemini won't always follow exactly).
 */
export function validateShieldReview(
  shieldReview: ShieldReview,
  ads: AdVariation[]
): ShieldValidationResult {
  const adIds = ads.map((ad) => ad.id);
  const reviewedIds = shieldReview.reviewedAds.map((r) => r.adVariationId);

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

  for (const reviewedAd of shieldReview.reviewedAds) {
    const ad = adsById.get(reviewedAd.adVariationId);
    if (!ad) continue; // unreachable given the coverage check above, but keeps TS satisfied

    const adText = `${ad.hook} ${ad.body} ${ad.cta}`.toLowerCase();

    for (const finding of reviewedAd.findings) {
      if (!adText.includes(finding.flaggedPhrase.toLowerCase())) {
        return {
          valid: false,
          reason: `Shield flagged "${finding.flaggedPhrase}" on ad "${ad.id}", but that phrase does not appear in the ad's hook/body/cta.`,
        };
      }
    }

    if (reviewedAd.findings.length === 0 && reviewedAd.overallRiskLevel !== "none") {
      return {
        valid: false,
        reason: `Ad "${ad.id}" has no findings but overallRiskLevel is "${reviewedAd.overallRiskLevel}" instead of "none".`,
      };
    }

    if (reviewedAd.findings.length > 0 && reviewedAd.overallRiskLevel === "none") {
      return {
        valid: false,
        reason: `Ad "${ad.id}" has findings but overallRiskLevel is "none".`,
      };
    }

    if (reviewedAd.finalCompliantVersion.trim().length === 0) {
      return {
        valid: false,
        reason: `Ad "${ad.id}" has an empty finalCompliantVersion.`,
      };
    }
  }

  return { valid: true };
}