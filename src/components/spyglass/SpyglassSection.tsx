import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SpyglassResult } from "@/lib/types";

interface SpyglassSectionProps {
  spyglass: SpyglassResult;
}

function TagList({ items, tone }: { items: string[]; tone: "teal" | "aqua" | "gray" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} tone={tone}>
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function SpyglassSection({ spyglass }: SpyglassSectionProps) {
  return (
    <section id="spyglass-section" className="mb-8 scroll-mt-6">
      <SectionHeading
        title="Spyglass Analysis"
        description="What the competitor page is selling, to whom, and how."
        icon={
          <Image
            src="/brand/spyglass-mark.svg"
            alt=""
            width={22}
            height={22}
            className="h-5 w-5"
          />
        }
      />

      <Card>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-1.5">
              Offer summary
            </div>
            <p className="font-body text-sm text-aegis-silver leading-relaxed">
              {spyglass.offerSummary}
            </p>
          </div>

          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-1.5">
              Positioning summary
            </div>
            <p className="font-body text-sm text-aegis-silver leading-relaxed">
              {spyglass.positioningSummary}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-1.5">
            Target audience
          </div>
          <p className="font-body text-sm text-aegis-silver">
            {spyglass.targetAudience}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
              Hooks
            </div>
            <TagList items={spyglass.hooks} tone="teal" />
          </div>

          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
              Emotional triggers
            </div>
            <TagList items={spyglass.emotionalTriggers} tone="aqua" />
          </div>

          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
              Claims
            </div>
            <TagList items={spyglass.claims} tone="gray" />
          </div>

          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
              Pain points
            </div>
            <TagList items={spyglass.painPoints} tone="gray" />
          </div>

          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
              CTAs
            </div>
            <TagList items={spyglass.ctas} tone="teal" />
          </div>

          <div>
            <div className="font-body text-xs uppercase tracking-wide text-aegis-gray mb-2">
              Creative opportunities
            </div>
            <ul className="space-y-1.5">
              {spyglass.creativeOpportunities.map((opp) => (
                <li
                  key={opp}
                  className="font-body text-sm text-aegis-silver leading-relaxed flex gap-2"
                >
                  <span className="text-aegis-teal">→</span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}