import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai";
import { buildQuestionPrompt } from "@/lib/prompts";
import { generateQuestionsAiSchema } from "@/lib/schema";

const requestSchema = z.object({
  requiredSkills: z.array(z.any()).min(1),
  candidateSkills: z.array(z.any()).min(1),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    console.log("Incoming body:", raw);

    const body = requestSchema.parse(raw);

    const prompt = buildQuestionPrompt(
      body.requiredSkills,
      body.candidateSkills
    );

    const generated = await generateStructuredJson(
      prompt,
      generateQuestionsAiSchema
    );

    console.log("AI output:", generated);

    if (!generated?.questionSets) {
      throw new Error("Invalid AI response structure");
    }

    return NextResponse.json({
      success: true,
      data: {
        questionSets: generated.questionSets,
      },
    });
  } catch (error) {
    console.error("Generate Questions Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate adaptive questions.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}