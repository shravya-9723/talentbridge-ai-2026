import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai";
import { buildLearningPlanPrompt } from "@/lib/prompts";
import { learningPlanAiSchema, matchedSkillSchema } from "@/lib/schema";

const weakSkillSchema = z.object({
  skill: z.string(),
  finalScore: z.number().min(0).max(10),
});

const requestSchema = z.object({
  missingSkills: z.array(matchedSkillSchema),
  weakSkills: z.array(weakSkillSchema),
  days: z.number().int().min(7).max(14).default(10),
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("healthCheck") === "true") {
      return NextResponse.json({
        success: true,
        data: {
          totalDays: 7,
          goals: ["Strengthen core full-stack readiness"],
          days: [
            {
              day: 1,
              focus: "TypeScript fundamentals",
              adjacentSkills: ["type narrowing", "interfaces"],
              estimatedMinutes: 60,
              resources: [
                {
                  title: "TypeScript Handbook",
                  url: "https://www.typescriptlang.org/docs/",
                  type: "docs",
                  estimatedMinutes: 45,
                },
              ],
            },
          ],
        },
      });
    }

    const body = requestSchema.parse(await req.json());
    const prompt = buildLearningPlanPrompt({
      missingSkills: body.missingSkills,
      weakSkills: body.weakSkills,
      days: body.days,
    });
    const plan = await generateStructuredJson(prompt, learningPlanAiSchema);

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate learning plan.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
