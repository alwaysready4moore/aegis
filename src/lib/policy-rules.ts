import type { RiskCategory } from "./types";

export interface PolicyRule {
  category: RiskCategory;
  label: string;
  description: string;
  guidance: string;
  examplePatterns: string[];
}

// This is intentionally a small, local, hand-written ruleset — not a scraped
// or licensed policy database. It exists to give Gemini (and any human
// reading this file) a consistent, shared definition of each risk category.
// It is illustrative, not exhaustive or legally authoritative: see the
// disclaimer in formatPolicyRulesForPrompt().
export const policyRules: PolicyRule[] = [
  {
    category: "misleading_claim",
    label: "Misleading claim",
    description:
      "A statement that overstates what the product can do, or implies a result the offer cannot reliably back up.",
    guidance:
      "Soften absolute language ('melts fat', 'cures') into supportive language ('supports', 'may help with').",
    examplePatterns: ["melt", "cure", "eliminate completely", "instantly"],
  },
  {
    category: "unsupported_superlative",
    label: "Unsupported superlative",
    description:
      "Claims of being the best, strongest, fastest, or only solution without a verifiable basis.",
    guidance:
      "Replace superlatives with specific, defensible product attributes instead of unverifiable rankings.",
    examplePatterns: ["#1", "best", "strongest", "most powerful", "only product that"],
  },
  {
    category: "aggressive_urgency",
    label: "Aggressive urgency",
    description:
      "Artificial scarcity or pressure tactics intended to rush a purchase decision.",
    guidance:
      "Keep a light sense of momentum without manufactured deadlines or countdown pressure.",
    examplePatterns: ["act now", "only hours left", "don't miss out", "last chance"],
  },
  {
    category: "health_or_medical_claim",
    label: "Health or medical claim",
    description:
      "Any statement implying diagnosis, treatment, cure, or prevention of a medical condition.",
    guidance:
      "Reframe around wellness support and general routine fit rather than medical outcomes.",
    examplePatterns: ["cures", "treats", "prevents disease", "doctor recommended", "clinically proven to cure"],
  },
  {
    category: "financial_promise",
    label: "Financial promise",
    description:
      "A specific, implied, or guaranteed financial return or earnings outcome.",
    guidance:
      "Frame around potential or typical use rather than promised financial results.",
    examplePatterns: ["guaranteed income", "make $X", "risk-free return", "double your money"],
  },
  {
    category: "guaranteed_outcome",
    label: "Guaranteed outcome",
    description:
      "Any explicit or implied guarantee of a specific result, especially within a fixed timeframe.",
    guidance:
      "Replace guarantees with framing around typical experience, consistency, or effort-linked progress.",
    examplePatterns: ["guaranteed results", "promised in days", "100% guaranteed", "or your money back"],
  },
  {
    category: "personal_attribute_targeting",
    label: "Personal attribute targeting",
    description:
      "Copy that directly references a person's health condition, financial situation, or other sensitive personal attribute as though the platform already knows it about them.",
    guidance:
      "Speak to the general audience and their goals rather than naming a personal condition or status directly.",
    examplePatterns: ["because you have", "for people struggling with your", "you've been diagnosed with"],
  },
  {
    category: "before_after_claim",
    label: "Before/after claim",
    description:
      "A specific transformation claim, often with a number and timeframe, implying a typical or guaranteed individual result.",
    guidance:
      "Generalize the timeframe and emphasize that results vary based on consistency and individual factors.",
    examplePatterns: ["lose 10 pounds in a week", "see results in 3 days", "before and after"],
  },
  {
    category: "fear_based_hook",
    label: "Fear-based hook",
    description:
      "An opening line designed to provoke anxiety or fear about a health, financial, or safety outcome to drive a click.",
    guidance:
      "Lead with the benefit or opportunity rather than the feared consequence of inaction.",
    examplePatterns: ["this silent danger", "you're at risk if", "doctors don't want you to know"],
  },
  {
    category: "platform_sensitive_wording",
    label: "Platform-sensitive wording",
    description:
      "Phrasing that is generally accurate but tends to trigger automated ad review systems on a specific platform (e.g. certain native-ad clickbait patterns).",
    guidance:
      "Match the platform's typical tone — more editorial for native placements, more direct for search.",
    examplePatterns: ["this one trick", "you won't believe", "click here now"],
  },
  {
    category: "substantiation_required",
    label: "Substantiation required",
    description:
      "A credibility or authority claim (expert endorsement, clinical backing, certification) stated without evidence on file.",
    guidance:
      "Replace with a claim the advertiser can actually substantiate, or remove the authority reference entirely.",
    examplePatterns: ["doctor recommended", "clinically proven", "scientifically tested", "award-winning"],
  },
  {
    category: "intellectual_property_risk",
    label: "Intellectual property risk",
    description:
      "Ad copy that names the competitor's brand, uses their trademarked terms, or closely mirrors their original slogan or marketing language rather than describing the advertiser's own offer in original words.",
    guidance:
      "Remove the competitor's brand name and trademarked terms. Rewrite the line in original language describing this advertiser's own product, rather than paraphrasing the competitor's copy closely enough that it reads as the same slogan.",
    examplePatterns: ["[competitor brand name]", "as seen on [competitor]", "better than [competitor product]"],
  },
];

export function getPolicyRule(category: RiskCategory): PolicyRule | undefined {
  return policyRules.find((rule) => rule.category === category);
}

// Renders the ruleset as a compact bullet list for injection into the Shield
// prompt. Kept separate from the raw `policyRules` data so the prompt-facing
// format can change without touching the underlying definitions.
export function formatPolicyRulesForPrompt(): string {
  return policyRules
    .map(
      (rule) =>
        `- ${rule.category}: ${rule.description} Guidance: ${rule.guidance}`
    )
    .join("\n");
}

// Disclaimer worth keeping visible to anyone editing this file: these
// categories and examples are a starting heuristic for an MVP, not a
// substitute for each ad platform's actual policy documentation.
export const POLICY_DISCLAIMER =
  "This is a local heuristic ruleset for triage purposes only. It does not replace each platform's official ad policy review.";