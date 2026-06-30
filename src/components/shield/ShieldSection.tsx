import { ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewedAdCard } from "./ReviewedAdCard";
import type { ShieldReview, AdVariation } from "@/lib/types";

interface ShieldSectionProps {
  shield: ShieldReview;
  ads: AdVariation[];
}

export function ShieldSection({ shield, ads }: ShieldSectionProps) {
  return (
    <section id="shield-section" className="mb-8 scroll-mt-6">
      <SectionHeading
        title="Shield Review"
        description={`${shield.totalRisksChecked} risks checked · ${shield.saferAdsDelivered} safer ads ready to copy.`}
        icon={<ShieldCheck size={18} />}
      />
      <div className="space-y-4">
        {shield.reviewedAds.map((reviewedAd) => (
          <ReviewedAdCard key={reviewedAd.adVariationId} reviewedAd={reviewedAd} ads={ads} />
        ))}
      </div>
    </section>
  );
}