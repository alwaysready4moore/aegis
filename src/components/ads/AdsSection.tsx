import { Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AdCard } from "./AdCard";
import type { AdVariation } from "@/lib/types";

interface AdsSectionProps {
  ads: AdVariation[];
}

export function AdsSection({ ads }: AdsSectionProps) {
  return (
    <section className="mb-8">
      <SectionHeading
        title="Generated Ads"
        description={`${ads.length} variations, ready to test before Shield review.`}
        icon={<Sparkles size={18} />}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}