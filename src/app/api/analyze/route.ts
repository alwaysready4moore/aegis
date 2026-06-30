import { NextResponse } from "next/server";
import { AegisAnalysisResultSchema } from "@/lib/schemas";
import { sampleAnalysis } from "@/lib/sample-data";

export async function POST() {
  const parsed = AegisAnalysisResultSchema.safeParse(sampleAnalysis);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Sample data failed schema validation.", details: parsed.error.flatten() },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed.data);
}