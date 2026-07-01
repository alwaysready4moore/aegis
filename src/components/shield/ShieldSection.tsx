import Image from "next/image";
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
        icon={
          <Image
            src="/brand/shield-mark.svg"
            alt=""
            width={22}
            height={22}
            className="h-5 w-5"
          />
        }
      />

      <div className="space-y-4">
        {shield.reviewedAds.map((reviewedAd) => (
          <ReviewedAdCard
            key={reviewedAd.adVariationId}
            reviewedAd={reviewedAd}
            ads={ads}
          />
        ))}
      </div>
    </section>
  );
}