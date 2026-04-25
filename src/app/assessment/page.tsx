"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers/app-state-provider";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientHeading } from "@/components/ui/gradient-heading";

export default function AssessmentPage() {
  const router = useRouter();
  const { state, setState } = useAppState();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.questions.length) {
      router.replace("/skill-match");
    }
  }, [router, state.questions.length]);

  if (!state.questions.length) return null;

  const current = state.questions[index];

  if (!current) return null;

  const progress = `${index + 1}/${state.questions.length}`;

  async function submit() {
    if (!current || !answer.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: current.skill,
          question: current.question,
          answer,
          candidateExperience: current.candidateExperience,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Evaluation failed");

      const updatedAnswers = [
        ...state.answers,
        {
          skill: current.skill,
          question: current.question,
          answer,
          evaluation: json.data,
        },
      ];

      setState((prev) => ({ ...prev, answers: updatedAnswers }));
      setAnswer("");

      if (index + 1 >= state.questions.length) {
        const missingSkills = state.matchedSkills.filter((item) => item.status === "missing");
        const grouped = new Map<string, number[]>();
        updatedAnswers.forEach((entry) => {
          const scores = grouped.get(entry.skill) ?? [];
          scores.push(entry.evaluation.finalScore);
          grouped.set(entry.skill, scores);
        });
        const weakFromAnswers = Array.from(grouped.entries())
          .map(([skill, scores]) => ({
            skill,
            finalScore: Number((scores.reduce((acc, v) => acc + v, 0) / scores.length).toFixed(2)),
          }))
          .filter((entry) => entry.finalScore < 4);

        const planResponse = await fetch("/api/generate-learning-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            missingSkills,
            weakSkills: weakFromAnswers,
            days: 10,
          }),
        });
        const planJson = await planResponse.json();
        if (!planResponse.ok || !planJson.success) throw new Error(planJson.error ?? "Plan generation failed");

        setState((prev) => ({
          ...prev,
          answers: updatedAnswers,
          weakSkills: weakFromAnswers,
          learningPlan: planJson.data,
        }));
        router.push("/dashboard");
        return;
      }

      setIndex((prev) => prev + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="animate-enter min-h-screen px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <GlassCard>
          <GradientHeading>Assessment Chat</GradientHeading>
          <p className="mt-2 text-sm text-slate-600">
            Skill: <span className="font-semibold">{current.skill}</span> • Question {progress}
          </p>
        </GlassCard>

        <GlassCard className="space-y-4">
          <ChatBubble role="ai" text={current.question} />
          {answer && <ChatBubble role="user" text={answer} />}

          <textarea
            className="min-h-36 w-full rounded-xl border border-white/70 bg-white/70 p-4 text-sm outline-none focus:border-pink-300"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
          />

          <div className="flex justify-end">
            <button
              className="rounded-xl bg-gradient-to-r from-[#6b8e23] via-[#ec4899] to-[#eab308] px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60"
              disabled={isLoading || !answer.trim()}
              onClick={() => void submit()}
            >
              {isLoading ? "Evaluating..." : "Submit Answer"}
            </button>
          </div>
        </GlassCard>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}