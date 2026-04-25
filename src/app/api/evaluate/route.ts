import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai";
import { buildAnswerEvaluationPrompt } from "@/lib/prompts";
import { answerEvaluationAiSchema } from "@/lib/schema";
import { applyScoring } from "@/lib/skill-utils";

const requestSchema = z.object({
  skill: z.string().min(1).default("general"),
  question: z.string().min(1).default("Assess answer quality"),
  answer: z.string().min(1),
  candidateExperience: z.number().min(0).max(10).default(5),
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("healthCheck") === "true") {
      return NextResponse.json({
        success: true,
        data: applyScoring({
          knowledge: 7,
          clarity: 7,
          confidence: 7,
          feedback: "Health check response.",
        }),
      });
    }

    const body = requestSchema.parse(await req.json());
    const prompt = buildAnswerEvaluationPrompt(body);
    const aiEvaluation = await generateStructuredJson(prompt, answerEvaluationAiSchema);
    const scored = applyScoring(aiEvaluation);

    return NextResponse.json({
      success: true,
      data: scored,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to evaluate answer.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
