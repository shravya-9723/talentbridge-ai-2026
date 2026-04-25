import type { LearningPlan, MatchedSkill, RequiredSkill } from "@/lib/schema";

export interface InterviewAnswer {
  skill: string;
  question: string;
  answer: string;
  evaluation: {
    knowledge: number;
    clarity: number;
    confidence: number;
    finalScore: number;
    category: "Strong" | "Moderate" | "Weak";
    feedback: string;
  };
}

export interface DashboardPayload {
  requiredSkills: RequiredSkill[];
  matchedSkills: MatchedSkill[];
  missingSkills: MatchedSkill[];
  weakSkills: Array<{ skill: string; finalScore: number }>;
  answers: InterviewAnswer[];
  learningPlan: LearningPlan;
}
