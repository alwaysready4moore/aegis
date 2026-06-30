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
 */
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function previewOf(raw: string): string {
  return raw.length > RAW_PREVIEW_LIMIT ? `${raw.slice(0, RAW_PREVIEW_LIMIT)}…` : raw;
}

/**
 * Parses a raw model response as JSON and validates it against a Zod schema.
 * Never throws — every failure path returns an AiParseFailure instead, so
 * callers (Stage 3's API routes) can decide what to do without try/catch
 * scattered through route handlers.
 */
export function parseAiJson<T>(raw: string, schema: z.ZodType<T>): AiParseResult<T> {
  const cleaned = stripCodeFences(raw);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err) {
    return {
      success: false,
      error: {
        stage: "json_parse",
        message: err instanceof Error ? err.message : "Failed to parse response as JSON.",
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