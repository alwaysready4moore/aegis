import { z } from "zod";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface AiParseSuccess<T> {
  success: true;
  data: T;
}

export type AiParseFailureStage = "json_parse" | "schema_validation";

export interface AiParseFailure {
  success: false;
  error: {
    stage: AiParseFailureStage;
    message: string;
    /** The raw text we attempted to parse, truncated for safe logging. */
    rawResponsePreview: string;
    /** Present only when stage is "schema_validation". Shape comes from Zod's .format(); kept as unknown here since AiParseFailure itself isn't generic over the schema's output type. */
    issues?: unknown;
  };
}

export type AiParseResult<T> = AiParseSuccess<T> | AiParseFailure;

// ---------------------------------------------------------------------------
// Core parsing
// ---------------------------------------------------------------------------

const RAW_PREVIEW_LIMIT = 500;

/**
 * Strips common wrapper patterns Gemini sometimes adds around JSON output,
 * even when explicitly instructed to return raw JSON:
 *   ```json
 *   { ... }
 *   ```
 * or plain triple backticks without a language tag.
 *
 * Only handles the case where fences wrap the ENTIRE trimmed response. A
 * preamble before the fence ("Here is the JSON:\n```json...") won't match
 * this regex — that's intentional. That messier case is handled by
 * extractJsonCandidate() as a second line of defense inside parseAiJson().
 */
export function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function previewOf(raw: string): string {
  return raw.length > RAW_PREVIEW_LIMIT ? `${raw.slice(0, RAW_PREVIEW_LIMIT)}…` : raw;
}

/**
 * Scans `text` starting at the first `{` or `[` and returns the substring up
 * to its matching closing bracket — i.e. the first complete, balanced JSON
 * value in the text, ignoring any preamble before it or commentary after
 * it. Tracks whether the scanner is inside a string literal so that braces
 * or brackets appearing inside quoted text (e.g. a hook like "Win {prize}!")
 * don't throw the depth count off.
 *
 * Deliberately a small hand-written scanner rather than a regex: balanced,
 * arbitrarily nested JSON can't be matched correctly by a regex in general,
 * and our ad/shield payloads nest objects inside arrays inside objects.
 *
 * Returns null if no balanced value is found (e.g. the response was
 * truncated mid-object) — callers treat that as "still couldn't parse it."
 */
function extractJsonCandidate(text: string): string | null {
  const startMatch = text.match(/[{[]/);
  if (!startMatch || startMatch.index === undefined) {
    return null;
  }

  const start = startMatch.index;
  const openChar = text[start];
  const closeChar = openChar === "{" ? "}" : "]";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === openChar) {
      depth++;
    } else if (char === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null; // never closed — truncated or unbalanced
}

/**
 * Parses a raw model response as JSON and validates it against a Zod schema.
 * Never throws — every failure path returns an AiParseFailure instead, so
 * callers (Stage 3's API routes) can decide what to do without try/catch
 * scattered through route handlers.
 *
 * Parse strategy, in order:
 *   1. Strip a fully-wrapping code fence, then try JSON.parse directly.
 *      This is the fast path and covers the common, well-behaved case.
 *   2. If that fails, scan for the first balanced {...} or [...] in the
 *      text and try JSON.parse on just that substring. This recovers from
 *      short preambles ("Here is the JSON:"), trailing commentary, or a
 *      fence that didn't wrap the *entire* response.
 *   3. If both fail, report the original parse error — we don't guess
 *      further than that.
 *
 * Either way, the result is still run through the Zod schema before being
 * trusted — extraction only gets us valid JSON, not valid *data*.
 */
export function parseAiJson<T>(raw: string, schema: z.ZodType<T>): AiParseResult<T> {
  const cleaned = stripCodeFences(raw);

  let parsedJson: unknown;
  let parseError: unknown;

  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err) {
    parseError = err;

    const candidate = extractJsonCandidate(cleaned);
    if (candidate) {
      try {
        parsedJson = JSON.parse(candidate);
        parseError = undefined;
      } catch (innerErr) {
        parseError = innerErr;
      }
    }
  }

  if (parseError) {
    return {
      success: false,
      error: {
        stage: "json_parse",
        message: parseError instanceof Error ? parseError.message : "Failed to parse response as JSON.",
        rawResponsePreview: previewOf(raw),
      },
    };
  }

  const result = schema.safeParse(parsedJson);
  if (!result.success) {
    return {
      success: false,
      error: {
        stage: "schema_validation",
        message: "Response JSON did not match the expected schema.",
        rawResponsePreview: previewOf(raw),
        issues: result.error.format(),
      },
    };
  }

  return { success: true, data: result.data };
}

// ---------------------------------------------------------------------------
// Fallback helper (planning for Stage 3)
// ---------------------------------------------------------------------------

/**
 * Stage 3 plan: API routes will call parseAiJson() on the Gemini response.
 * If it fails, we do NOT want the UI to crash or show a raw error screen —
 * the roadmap's "sample mode is the parachute" principle applies here too.
 *
 * This helper formalizes that fallback: on failure, log the structured
 * AiParseFailure (stage, message, truncated raw preview) somewhere the
 * developer can see it, then return a caller-supplied fallback value so the
 * pipeline can still render *something* — e.g. the Stage 1 sample fixture,
 * or a "Spyglass couldn't read this page" empty state, depending on the
 * route.
 *
 * Deliberately generic over T so it works for SpyglassResult, AdVariation[],
 * and ShieldReview alike. No network or API code here — purely a parse +
 * fallback decision, which is why it's safe to write in Stage 2.
 */
export function parseAiJsonWithFallback<T>(
  raw: string,
  schema: z.ZodType<T>,
  fallback: T,
  onFailure?: (failure: AiParseFailure["error"]) => void
): T {
  const result = parseAiJson(raw, schema);
  if (result.success) {
    return result.data;
  }
  onFailure?.(result.error);
  return fallback;
}