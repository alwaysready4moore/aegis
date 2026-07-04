import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const pipeline = [
  {
    icon: Search,
    title: "Spyglass finds the angle",
    body: "Aegis reads a competitor landing page and extracts the offer, audience, claims, hooks, CTAs, and positioning strategy.",
  },
  {
    icon: Sparkles,
    title: "Aegis drafts testable ads",
    body: "The app turns the page analysis into five original ad variations, each built around a different creative angle.",
  },
  {
    icon: ShieldCheck,
    title: "Shield checks the risk",
    body: "Shield reviews the generated ads for risky claims, sensitive wording, substantiation issues, and IP risk, then provides safer rewrites.",
  },
];

const principles = [
  "Working pipeline over feature sprawl",
  "Fallback behavior instead of broken demos",
  "Schema validation before trusting AI output",
  "Clear risk triage, not legal advice",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-aegis-black px-6 py-10 text-aegis-silver">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-body text-sm text-aegis-gray transition-colors hover:text-aegis-teal"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>

        <section className="mb-10">
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="/brand/aegis-mark.svg"
              alt="Aegis logo mark"
              width={72}
              height={72}
              priority
            />
            <div>
              <p className="font-body text-xs uppercase tracking-[0.28em] text-aegis-teal">
                About Aegis
              </p>
              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                Safer creative intelligence for media buyers.
              </h1>
            </div>
          </div>

          <p className="max-w-3xl font-body text-lg leading-8 text-aegis-gray">
            Aegis is a small AI pipeline for turning competitor landing pages into
            testable ad ideas with risk review built in. It was built as an MVP:
            one URL in, a clearer read on the angle, five ad variations, and safer
            copy-ready rewrites out.
          </p>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {pipeline.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <Icon className="mb-4 text-aegis-teal" size={24} />
                <h2 className="mb-2 font-heading text-xl font-semibold text-aegis-silver">
                  {item.title}
                </h2>
                <p className="font-body text-sm leading-6 text-aegis-gray">
                  {item.body}
                </p>
              </Card>
            );
          })}
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <h2 className="mb-3 font-heading text-2xl font-semibold">
              Why this exists
            </h2>
            <div className="space-y-4 font-body text-sm leading-7 text-aegis-gray">
              <p>
                Media buyers often move between competitive research, creative
                drafting, and policy checking as separate tasks. Aegis compresses
                those steps into one workflow so the buyer can spend more time
                judging the strategy and less time wrangling raw copy.
              </p>
              <p>
                The goal is not to replace human judgment or guarantee ad approval.
                Shield is a heuristic risk-triage layer that catches obvious issues
                before copy gets handed off, tested, or submitted for review.
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-heading text-2xl font-semibold">
              Build principles
            </h2>
            <ul className="space-y-3">
              {principles.map((principle) => (
                <li
                  key={principle}
                  className="flex gap-3 font-body text-sm text-aegis-gray"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-aegis-teal"
                    size={17}
                  />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="rounded-2xl border border-aegis-border bg-aegis-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">
                Try the pipeline
              </h2>
              <p className="mt-2 font-body text-sm text-aegis-gray">
                Start with sample mode, paste manual page text, or run a live URL
                through Firecrawl.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-aegis-teal px-4 py-2.5 font-body text-sm font-medium text-aegis-black transition-colors hover:bg-aegis-teal/80"
            >
              Open dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}