// SERVER-ONLY MODULE.
// Do not import this file from any "use client" component or from anything
// that could end up in a client bundle. It reads FIRECRAWL_API_KEY directly
// from process.env — Next.js only inlines env vars into the browser bundle
// when they're prefixed with NEXT_PUBLIC_, which this one deliberately is
// not. The only intended caller is src/app/api/analyze/route.ts (a Route
// Handler, which always runs server-side). Mirrors the shape of gemini.ts.

import Firecrawl from "@mendable/firecrawl-js";

let cachedClient: Firecrawl | null = null;

function getClient(): Firecrawl {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set in the server environment.");
  }
  if (!cachedClient) {
    cachedClient = new Firecrawl({ apiKey });
  }
  return cachedClient;
}

export type FirecrawlResult =
  | { success: true; text: string }
  | { success: false; message: string };

export const DEFAULT_MAX_EXTRACTED_CHARS = 10_000;

/**
 * Truncates extracted page text to a safe length before it's sent to
 * Gemini, so a very long landing page can't blow out latency or token cost.
 * Adds an ellipsis when truncated so it's visible in logs/debugging that the
 * text was cut, not just short.
 */
export function truncateText(
  text: string,
  maxChars: number = DEFAULT_MAX_EXTRACTED_CHARS
): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars).trim()}…`;
}

/**
 * Scrapes a single URL and returns clean markdown text. Never throws — every
 * failure path (missing key, network error, Firecrawl error response, empty
 * content) returns { success: false } so the calling route can fall back
 * safely instead of crashing. One URL only — no crawling, no pagination, no
 * multi-page traversal, matching the MVP scope.
 */
export async function scrapeUrlToText(url: string): Promise<FirecrawlResult> {
  try {
    const firecrawl = getClient();
    const result = await firecrawl.scrape(url, { formats: ["markdown"] });

    // The SDK's response shape has moved around across versions in its
    // changelog, so check the common locations for markdown content
    // defensively rather than assuming one fixed shape.
    const markdown =
      (result as { markdown?: string })?.markdown ??
      (result as { data?: { markdown?: string } })?.data?.markdown ??
      null;

    if (!markdown || markdown.trim().length === 0) {
      return {
        success: false,
        message: "Firecrawl returned no readable content for this URL.",
      };
    }

    return { success: true, text: markdown.trim() };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown Firecrawl error.",
    };
  }
}