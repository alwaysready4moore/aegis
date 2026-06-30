// SERVER-ONLY MODULE.
// Do not import this file from any "use client" component or from anything
// that could end up in a client bundle. It reads GEMINI_API_KEY directly
// from process.env — Next.js only inlines env vars into the browser bundle
// when they're prefixed with NEXT_PUBLIC_, which this one deliberately is
// not. The only intended caller is src/app/api/analyze/route.ts (a Route
// Handler, which always runs server-side).

import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the server environment.");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export type GeminiCallResult =
  | { success: true; text: string }
  | { success: false; message: string };

/**
 * Sends a prompt to Gemini and asks for a JSON-only response. Never throws —
 * every failure path (missing key, network error, empty response) returns a
 * { success: false } result so the calling route can fall back safely
 * instead of crashing.
 */
export async function generateJsonContent(prompt: string): Promise<GeminiCallResult> {
  try {
    const ai = getClient();
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      return { success: false, message: "Gemini returned an empty response." };
    }

    return { success: true, text };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unknown Gemini API error.",
    };
  }
}