import type { CandidateSkill, MatchedSkill, RequiredSkill } from "@/lib/schema";

export const FREE_TIER_NOTE =
  "Keep output concise. This app runs on a free-tier model, so avoid verbosity.";

export function buildSkillExtractionPrompt(resume: string, jobDescription: string): string {
  return `
You are TalentBridge AI, a recruiter-grade skill analysis engine.
Return ONLY valid JSON matching this exact shape:
{
  "requiredSkills": [{ "name": "string", "importance": 1-10 }],
  "candidateSkills": [{ "name": "string", "experienceLevel": 0-10 }]
}

Rules:
- Extract 8-20 required skills from the job description with realistic importance.
- Extract 8-25 candidate skills from the resume with realistic experience level.
- Normalize skill names to concise lowercase phrases (e.g. "react", "node.js", "sql").
- Do not include commentary or markdown.
- ${FREE_TIER_NOTE}

Job Description:
${jobDescription}

Resume:
${resume}
`.trim();
}

export function buildQuestionPrompt(
  requiredSkills: RequiredSkill[],
  candidateSkills: CandidateSkill[],
): string {
  return `
You generate adaptive technical interview questions.
Return ONLY valid JSON matching:
{
  "questionSets": [
    { "skill": "string", "questions": ["q1","q2","q3"] }
  ]
}

Rules:
- Generate exactly 3 questions per required skill.
- Adjust difficulty by candidate experience:
  - 0-3: foundational + practical basics
  - 4-7: intermediate + scenario-based
  - 8-10: advanced architecture/debugging
- Keep each question one sentence and specific.
- No duplicates.
- ${FREE_TIER_NOTE}

Required Skills:
${JSON.stringify(requiredSkills)}

Candidate Skills:
${JSON.stringify(candidateSkills)}
`.trim();
}

export function buildAnswerEvaluationPrompt(input: {
  skill: string;
  question: string;
  answer: string;
  candidateExperience: number;
}): string {
  return `
Evaluate a candidate answer.
Return ONLY valid JSON:
{
  "knowledge": 0-10,
  "clarity": 0-10,
  "confidence": 0-10,
  "feedback": "short actionable feedback"
}

Scoring intent:
- knowledge: correctness, depth, and relevance.
- clarity: structure, precision, communication.
- confidence: decisiveness and ownership (not arrogance).

Keep feedback under 40 words.
Question skill: ${input.skill}
Expected experience level: ${input.candidateExperience}
Question: ${input.question}
Answer: ${input.answer}
`.trim();
}

export function buildLearningPlanPrompt(input: {
  missingSkills: MatchedSkill[];
  weakSkills: Array<{ skill: string; finalScore: number }>;
  days: number;
}): string {
  return `
Create a realistic, focused learning plan.
Return ONLY valid JSON matching:
{
  "totalDays": 7-14,
  "goals": ["string"],
  "days": [
    {
      "day": 1,
      "focus": "string",
      "adjacentSkills": ["string"],
      "estimatedMinutes": number,
      "resources": [
        {
          "title": "string",
          "url": "https://...",
          "type": "youtube|docs|article|course",
          "estimatedMinutes": number
        }
      ]
    }
  ]
}

Rules:
- totalDays must be ${input.days}.
- Prioritize missing skills first, then weak skills.
- Include practical adjacent skills in each day.
- Provide 2-3 resources per day with valid public links.
- Keep plan realistic for a working professional.
- ${FREE_TIER_NOTE}

Missing Skills:
${JSON.stringify(input.missingSkills)}

Weak Skills:
${JSON.stringify(input.weakSkills)}
`.trim();
}
