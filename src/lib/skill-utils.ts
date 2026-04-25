import type {
  AnswerEvaluation,
  EvaluationCategory,
  MatchedSkill,
  RequiredSkill,
} from "@/lib/schema";

function normalize(skill: string): string {
  return skill.trim().toLowerCase();
}

export function matchSkills(input: {
  requiredSkills: RequiredSkill[];
  candidateSkills: Array<{ name: string; experienceLevel: number }>;
}): MatchedSkill[] {
  const candidateMap = new Map(
    input.candidateSkills.map((skill) => [normalize(skill.name), skill.experienceLevel]),
  );

  return input.requiredSkills.map((required) => {
    const candidateExperience = candidateMap.get(normalize(required.name)) ?? 0;
    return {
      skill: required.name,
      status: candidateExperience > 0 ? "matched" : "missing",
      importance: required.importance,
      candidateExperience,
    } as const;
  });
}

export function computeFinalScore(knowledge: number, clarity: number, confidence: number): number {
  const raw = knowledge * 0.5 + clarity * 0.3 + confidence * 0.2;
  return Number(raw.toFixed(2));
}

export function categorizeScore(finalScore: number): EvaluationCategory {
  if (finalScore >= 7) return "Strong";
  if (finalScore >= 4) return "Moderate";
  return "Weak";
}

export function applyScoring(
  partial: Omit<AnswerEvaluation, "finalScore" | "category">,
): AnswerEvaluation {
  const finalScore = computeFinalScore(partial.knowledge, partial.clarity, partial.confidence);
  const category = categorizeScore(finalScore);
  return {
    ...partial,
    finalScore,
    category,
  };
}
