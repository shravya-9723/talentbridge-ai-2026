import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai";
import { buildSkillExtractionPrompt } from "@/lib/prompts";
import { analyzeSkillsAiSchema } from "@/lib/schema";
import { matchSkills } from "@/lib/skill-utils";

const requestSchema = z.object({
  resume: z.string().min(30),
  jobDescription: z.string().min(30),
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("healthCheck") === "true") {
      return NextResponse.json({
        success: true,
        data: {
          requiredSkills: [{ name: "typescript", importance: 8 }],
          candidateSkills: [{ name: "typescript", experienceLevel: 6 }],
          matchedSkills: [
            {
              skill: "typescript",
              status: "matched",
              importance: 8,
              candidateExperience: 6,
            },
          ],
          gapAnalysis: {
            directGap: [],
          },
        },
      });
    }

    const body = requestSchema.parse(await req.json());
    const prompt = buildSkillExtractionPrompt(body.resume, body.jobDescription);
    const extracted = await generateStructuredJson(prompt, analyzeSkillsAiSchema);
    const matchedSkills = matchSkills(extracted);

    const missingSkills = matchedSkills.filter((skill) => skill.status === "missing");

    return NextResponse.json({
      success: true,
      data: {
        requiredSkills: extracted.requiredSkills,
        candidateSkills: extracted.candidateSkills,
        matchedSkills,
        gapAnalysis: {
          directGap: missingSkills,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze skills.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
