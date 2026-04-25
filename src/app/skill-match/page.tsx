"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers/app-state-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientHeading } from "@/components/ui/gradient-heading";
import type { MatchedSkill } from "@/lib/schema";
import { useState } from "react";

export default function SkillMatchPage() {
  const router = useRouter();
  const { state, setState } = useAppState();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.matchedSkills.length) {
      router.replace("/");
    }
  }, [router, state.matchedSkills.length]);

  async function startAssessment() {
    setIsStarting(true);
    setError(null);
    const analyzeCandidateSkills = state.matchedSkills.map((skill) => ({
      name: skill.skill,
      experienceLevel: skill.candidateExperience,
    }));

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredSkills: state.requiredSkills,
          candidateSkills: analyzeCandidateSkills,
          maxQuestions: 15,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error ?? "Failed to generate questions.");

      const candidateMap = new Map(state.matchedSkills.map((item) => [item.skill.toLowerCase(), item.candidateExperience]));
      const questions = json.data.questionSets.flatMap((set: { skill: string; questions: string[] }) =>
        set.questions.map((question) => ({
          skill: set.skill,
          question,
          candidateExperience: candidateMap.get(set.skill.toLowerCase()) ?? 0,
        })),
      );

      setState((prev) => ({ ...prev, questions, answers: [] }));
      router.push("/assessment");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsStarting(false);
    }
  }

  if (!state.matchedSkills.length) {
    return null;
  }

  return (
    <main className="animate-enter min-h-screen px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <GlassCard>
          <GradientHeading>Skill Match Overview</GradientHeading>
          <p className="mt-2 text-sm text-slate-600">Required vs candidate skill fit before assessment.</p>
        </GlassCard>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/60 text-slate-700">
                  <th className="p-3">Skill</th>
                  <th className="p-3">Required</th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.matchedSkills.map((item: MatchedSkill) => (
                  <tr key={item.skill} className="border-b border-white/40">
                    <td className="p-3">{item.skill}</td>
                    <td className="p-3">{item.importance}/10</td>
                    <td className="p-3">{item.candidateExperience}/10</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "matched"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "missing"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button
            className="rounded-xl bg-gradient-to-r from-[#6b8e23] via-[#ec4899] to-[#eab308] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:opacity-60"
            onClick={() => void startAssessment()}
            disabled={isStarting}
          >
            {isStarting ? "Preparing..." : "Start Assessment"}
          </button>
        </div>
        {error ? <p className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}
