import { z } from "zod";

export const requiredSkillSchema = z.object({
  name: z.string(),
  importance: z.number().min(1).max(10),
});

export const candidateSkillSchema = z.object({
  name: z.string(),
  experienceLevel: z.number().min(0).max(10),
});

export const matchedSkillSchema = z.object({
  skill: z.string(),
  status: z.enum(["matched", "missing", "weak"]),
  importance: z.number().min(1).max(10),
  candidateExperience: z.number().min(0).max(10),
});

export const analyzeSkillsAiSchema = z.object({
  requiredSkills: z.array(requiredSkillSchema),
  candidateSkills: z.array(candidateSkillSchema),
});

export const generatedQuestionSchema = z.object({
  skill: z.string(),
  questions: z.array(z.string()).length(3),
});

export const generateQuestionsAiSchema = z.object({
  questionSets: z.array(generatedQuestionSchema),
});

export const answerEvaluationAiSchema = z.object({
  knowledge: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  feedback: z.string(),
});

export const learningResourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  type: z.enum(["youtube", "docs", "article", "course"]),
  estimatedMinutes: z.number().int().positive(),
});

export const learningDaySchema = z.object({
  day: z.number().int().positive(),
  focus: z.string(),
  adjacentSkills: z.array(z.string()),
  estimatedMinutes: z.number().int().positive(),
  resources: z.array(learningResourceSchema),
});

export const learningPlanAiSchema = z.object({
  totalDays: z.number().int().min(7).max(14),
  goals: z.array(z.string()),
  days: z.array(learningDaySchema),
});

export type RequiredSkill = z.infer<typeof requiredSkillSchema>;
export type CandidateSkill = z.infer<typeof candidateSkillSchema>;
export type MatchedSkill = z.infer<typeof matchedSkillSchema>;
export type GeneratedQuestionSet = z.infer<typeof generatedQuestionSchema>;
export type LearningPlan = z.infer<typeof learningPlanAiSchema>;

export type EvaluationCategory = "Strong" | "Moderate" | "Weak";

export interface AnswerEvaluation {
  knowledge: number;
  clarity: number;
  confidence: number;
  finalScore: number;
  category: EvaluationCategory;
  feedback: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}
