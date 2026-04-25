import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredJson } from "@/lib/ai";
import { buildQuestionPrompt } from "@/lib/prompts";
import { generateQuestionsAiSchema, requiredSkillSchema, candidateSkillSchema } from "@/lib/schema";

const requestSchema = z.object({
  requiredSkills: z.array(requiredSkillSchema).min(1),
  candidateSkills: z.array(candidateSkillSchema).default([]),
  maxQuestions: z.number().int().min(1).max(60).default(15),
});

function fallbackQuestionSet(skill: string, experience: number): string[] {
  if (experience <= 3) {
    return [
      `What is ${skill}, and where is it commonly used in real projects?`,
      `Walk through a basic ${skill} task you can implement end-to-end.`,
      `What common mistakes should beginners avoid when working with ${skill}?`,
    ];
  }

  if (experience <= 7) {
    return [
      `Describe how you would design a maintainable feature using ${skill}.`,
      `How do you debug a production issue related to ${skill} under time pressure?`,
      `Explain one performance trade-off you have handled while using ${skill}.`,
    ];
  }

  return [
    `How would you architect a scalable system where ${skill} is a core dependency?`,
    `What advanced failure modes can occur with ${skill}, and how would you mitigate them?`,
    `Explain your strategy for balancing reliability, performance, and developer velocity with ${skill}.`,
  ];
}

function trimQuestionSets(
  questionSets: Array<{ skill: string; questions: string[] }>,
  maxQuestions: number,
) {
  let used = 0;
  const trimmed: Array<{ skill: string; questions: string[] }> = [];

  for (const set of questionSets) {
    if (used >= maxQuestions) break;
    const remaining = maxQuestions - used;
    const subset = set.questions.slice(0, remaining);
    if (!subset.length) continue;
    trimmed.push({ skill: set.skill, questions: subset });
    used += subset.length;
  }

  return trimmed;
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("healthCheck") === "true") {
      return NextResponse.json({
        success: true,
        data: {
          questionSets: [
            {
              skill: "typescript",
              questions: [
                "What problem does TypeScript solve in JavaScript projects?",
                "How do you model optional data safely in TypeScript?",
                "Describe a TypeScript refactor that improved reliability.",
              ],
            },
          ],
          source: "health-check",
        },
      });
    }

    const body = requestSchema.parse(await req.json());
    const candidateMap = new Map(body.candidateSkills.map((skill) => [skill.name.toLowerCase(), skill.experienceLevel]));

    try {
      const prompt = buildQuestionPrompt(body.requiredSkills, body.candidateSkills);
      const generated = await generateStructuredJson(prompt, generateQuestionsAiSchema);

      const normalized = generated.questionSets.map((set) => ({
        skill: set.skill,
        questions: set.questions.slice(0, 3),
      }));
      const limited = trimQuestionSets(normalized, body.maxQuestions);

      return NextResponse.json({
        success: true,
        data: {
          questionSets: limited,
          source: "ai",
        },
      });
    } catch {
      // Free-tier model outputs can occasionally fail strict JSON format.
      // Fall back to deterministic questions so assessment flow never blocks.
      const fallbackSets = body.requiredSkills.map((required) => ({
        skill: required.name,
        questions: fallbackQuestionSet(required.name, candidateMap.get(required.name.toLowerCase()) ?? 0),
      }));
      const limited = trimQuestionSets(fallbackSets, body.maxQuestions);

      return NextResponse.json({
        success: true,
        data: {
          questionSets: limited,
          source: "fallback",
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request for question generation.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
