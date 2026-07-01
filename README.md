# Aegis

**Creative intelligence for media buyers: paste a competitor landing page, get testable ad variations with risky language already flagged.**

## What it does

Aegis reads a competitor's landing page, figures out the angle they're selling, drafts five original ad variations based on that analysis, and reviews those ads for language likely to get flagged by ad platform policy systems. Every ad that comes out the other end has a copy-ready "final compliant version" — the rewritten copy with risky phrases already softened.

## The problem it solves

If you buy media for a living, this workflow is familiar: find a competitor's ad, read their landing page, guess at their angle, write your own version, then separately check whether your copy is going to get rejected by Meta or Google's ad review before you've even launched it. That's four different mental modes stitched together by hand, usually under time pressure.

Aegis doesn't replace that judgment — it compresses the mechanical parts of it into one pass, so a media buyer's time goes toward deciding which angle to actually run, not toward the busywork of getting there.

## How it works

Aegis runs a four-stage pipeline, each stage feeding the next:

1. **Extraction** — get the competitor page's text, either by scraping the URL with Firecrawl or from page text you paste in directly.
2. **Spyglass** — Gemini reads that text and extracts the offer, target audience, hooks, emotional triggers, claims, pain points, and CTAs, plus a short read on the page's overall positioning.
3. **Ad generation** — Gemini turns Spyglass's analysis into five distinct ad variations, each testing a different angle.
4. **Shield** — Gemini reviews those five ads against a twelve-category risk checklist (misleading claims, unsupported superlatives, aggressive urgency, health/medical claims, financial promises, guaranteed outcomes, personal attribute targeting, before/after claims, fear-based hooks, platform-sensitive wording, substantiation requirements, and intellectual property risk), flags anything that needs a rewrite, and produces a final compliant version of each ad.

Every stage's output is validated against a Zod schema before it's trusted. If Gemini returns malformed JSON, the wrong number of ads, or a Shield review that flags a phrase that doesn't actually appear in the ad it's attached to, that response is rejected and the app falls back to sample data instead of showing broken or fabricated results.

## Demo modes

The dashboard has three ways to run an analysis, in order of how "real" the input is:

- **Try Sample Analysis** — instant, uses a hardcoded fixture. Always works, no API calls, useful for seeing the full UI without waiting on anything.
- **Manual Page Text** — an "Advanced" section on the input card. Paste a competitor's landing page copy directly and skip Firecrawl entirely. This is the fastest way to test the live Gemini pipeline (Spyglass → ads → Shield) without depending on a page being scrapeable.
- **Firecrawl URL Extraction** — the primary intended flow. Paste a URL, leave manual text blank, and Aegis scrapes the page itself before running the same live pipeline.

## Tech stack

- **Next.js** (App Router) — frontend and API routes in one project, no separate backend
- **TypeScript** — throughout, strict mode on
- **Tailwind CSS** — styling, dark charcoal/teal design system
- **Zod** — single source of truth for every data shape; every AI response is validated against a schema before the app trusts it, and TypeScript types are derived from those schemas rather than maintained separately
- **Gemini** (`@google/genai`) — Spyglass analysis, ad generation, and Shield review
- **Firecrawl** (`@mendable/firecrawl-js`) — single-page URL scraping to markdown

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Yes, for live mode | From Google AI Studio. Sample mode works without it. |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash` if unset. |
| `FIRECRAWL_API_KEY` | Yes, for URL extraction | From firecrawl.dev. Manual Page Text mode works without it. |

No key is ever read outside server-only code (`src/lib/gemini.ts`, `src/lib/firecrawl.ts`), and neither is prefixed with `NEXT_PUBLIC_`, so neither is ever bundled into the browser.

## Local setup (Windows / PowerShell)

```powershell
npm.cmd install
copy .env.example .env.local
# then edit .env.local and add your real GEMINI_API_KEY / FIRECRAWL_API_KEY
npm.cmd run dev
```

Open `http://localhost:3000`. Click **Try Sample Analysis** first to confirm the app runs before testing live mode.

Before committing changes:

```powershell
npm.cmd run lint
npm.cmd run build
```

## Safety and fallback behavior

Every external call in this app — Firecrawl, and each of the three Gemini calls — can fail, time out, get rate-limited, or return malformed output. None of those failures crash the app or show the person a raw error. Instead:

- Each pipeline stage (extraction, Spyglass, ads, Shield) independently reports whether it ran **live**, used **manual** input, was **skipped**, or **fell back** to sample data — visible as status badges on the dashboard after any run.
- If a stage falls back, the specific reason is shown in a notice on the page (e.g. "Shield: Gemini call failed: 503" or "Ad generation returned 3 ads instead of the required 5") — not a generic error, and not a stack trace.
- A failure in one stage doesn't necessarily sink the whole result: if Spyglass and ad generation succeed live but Shield fails, you still get live Spyglass output and live ads, with sample data filling in just the Shield section.
- Sample mode has no external dependencies at all, so the demo is never unusable — even with no API keys configured, no internet, or both providers down at once, the app still runs and shows a complete result.

**Shield is a heuristic risk-triage tool, not legal advice and not an official platform review.** Its risk categories are a hand-authored starting checklist, not a substitute for reading Meta's, Google's, or any other platform's actual current ad policies. It's meant to catch obvious problems before you submit an ad for real review, not to guarantee approval.

## Known limitations

- **KPI numbers are still sample-derived**, even during a fully live run — `anglesFound`, `risksChecked`, etc. aren't yet recomputed from the real Spyglass/Shield output for that specific run.
- **Shield only reviews the generated ad copy itself.** It verifies that every flagged phrase actually appears in the ad it's attached to, which is a real correctness guarantee — but it doesn't evaluate the underlying offer for third-party IP issues (e.g. a page built around someone else's copyrighted characters or franchise). That's a different kind of check than anything in the current pipeline.
- **One URL at a time.** No multi-page crawling, no site-wide analysis — intentionally, to keep the MVP scope contained.
- **No automatic retry on transient failures.** A `429` (quota) or `503` (model overloaded) from Gemini goes straight to fallback rather than retrying with backoff first.
- **No persistence.** Every analysis is a fresh run; nothing is saved between sessions, and there's no history to look back on.
- **Free-tier rate limits are real.** Heavy back-to-back testing will trigger fallbacks from quota limits, not code bugs — this is expected and part of why fallback behavior exists.
- **Policy rules are a static, hand-written checklist**, not live-synced with any ad platform's actual current policy documentation.

## What I'd build next

If this became a real full-time project, in rough priority order:

1. **Retry with backoff** for transient Gemini errors (429/503) before falling back — the single highest-value reliability improvement given how often free-tier limits surface during testing.
2. **Live KPI computation** so the summary numbers reflect the actual run instead of a static sample baseline.
3. **Spyglass-level third-party IP/franchise detection** — flagging when the underlying offer itself references someone else's copyrighted or trademarked property, as a separate signal from Shield's ad-copy-language checks.
4. **Saved analysis history**, which would be the first real justification for adding a database — deliberately left out of this MVP.
5. **Per-platform ad diversification** in a single run (one ad each for Meta, Google, TikTok, etc.) instead of five ads for one platform.
6. **Real per-stage progress** in the loading state, via streaming, instead of a rotating status message that doesn't know what the server is actually doing.

## Contest note

This was built as an MVP for a five-day build challenge, not a production app. The scope was chosen deliberately:

- **Working pipeline over polish.** Every stage runs end-to-end with real fallback handling, which mattered more than a fully-loaded feature set.
- **No auth, no database, no billing, no real ad platform integrations** — all left out on purpose, not from running out of time. None of them were needed to prove the core idea: a competitor URL in, a safer set of testable ads out.
- **Sample mode isn't a placeholder feature — it's the parachute.** It exists so the demo works even if a live API call fails during judging, which is exactly the kind of failure a five-minute demo window can't afford.

Live demo: *[add Vercel URL here once deployed]*
Repo: *[this repo]*