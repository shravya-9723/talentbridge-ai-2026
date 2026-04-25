import type { LearningPlan, MatchedSkill, RequiredSkill } from "@/lib/schema";
import type { InterviewAnswer } from "@/lib/session";

export interface AssessmentQuestion {
  skill: string;
  question: string;
  candidateExperience: number;
}

export interface AppState {
  resumeText: string;
  jdText: string;
  requiredSkills: RequiredSkill[];
  matchedSkills: MatchedSkill[];
  questions: AssessmentQuestion[];
  answers: InterviewAnswer[];
  weakSkills: Array<{ skill: string; finalScore: number }>;
  learningPlan: LearningPlan | null;
}

export const initialAppState: AppState = {
  resumeText: "",
  jdText: "",
  requiredSkills: [],
  matchedSkills: [],
  questions: [],
  answers: [],
  weakSkills: [],
  learningPlan: null,
};
