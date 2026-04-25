"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers/app-state-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { UploadBox } from "@/components/ui/upload-box";

const SAMPLE_RESUME = `Software engineer with 3 years of experience building React and Node.js applications. Built REST APIs with Express, PostgreSQL queries, authentication using JWT, and deployed projects on Vercel and AWS. Used TypeScript, GitHub Actions, Docker, and Jest for testing.`;
const SAMPLE_JD = `We need a full-stack engineer skilled in Next.js, React, TypeScript, Node.js, REST API design, SQL, Docker, CI/CD, cloud deployment, and system design. Strong communication and debugging skills required.`;

export default function Home() {
  const router = useRouter();
  const { state, setState, resetState } = useAppState();
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthReport, setHealthReport] = useState<Array<{ name: string; ok: boolean; detail: string }> | null>(null);

  async function analyze() {
    setIsLoading(true);
    setError(null);

    try {
      const analyzeRes = await fetch("/api/analyze-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const analyzeJson = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeJson.success) throw new Error(analyzeJson.error ?? "Analyze failed");

      const withWeak = analyzeJson.data.matchedSkills.map(
        (skill: { skill: string; status: "matched" | "missing"; importance: number; candidateExperience: number }) => ({
          ...skill,
          status: skill.status === "matched" && skill.candidateExperience < 4 ? "weak" : skill.status,
        }),
      );

      setState({
        ...state,
        resumeText: resume,
        jdText: jobDescription,
        requiredSkills: analyzeJson.data.requiredSkills,
        matchedSkills: withWeak,
        questions: [],
        answers: [],
        weakSkills: [],
        learningPlan: null,
      });
      router.push("/skill-match");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function runHealthCheck() {
    setIsCheckingHealth(true);
    setError(null);
    setHealthReport(null);

    const checks: Array<{ name: string; path: string; body: Record<string, unknown> }> = [
      {
        name: "Analyze Skills API",
        path: "/api/analyze-skills?healthCheck=true",
        body: { resume: "health", jobDescription: "health" },
      },
      {
        name: "Generate Questions API",
        path: "/api/generate-questions?healthCheck=true",
        body: { requiredSkills: [{ name: "typescript", importance: 8 }], candidateSkills: [] },
      },
      {
        name: "Evaluate API",
        path: "/api/evaluate?healthCheck=true",
        body: { answer: "health" },
      },
      {
        name: "Learning Plan API",
        path: "/api/generate-learning-plan?healthCheck=true",
        body: { missingSkills: [], weakSkills: [], days: 7 },
      },
    ];

    const results = await Promise.all(
      checks.map(async (check) => {
        try {
          const res = await fetch(check.path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(check.body),
          });
          const json = await res.json();
          return {
            name: check.name,
            ok: Boolean(res.ok && json.success),
            detail: res.ok && json.success ? "OK" : (json.error ?? "Failed"),
          };
        } catch (e) {
          return {
            name: check.name,
            ok: false,
            detail: e instanceof Error ? e.message : "Network error",
          };
        }
      }),
    );

    setHealthReport(results);
    setIsCheckingHealth(false);
  }

  return (
    <main className="animate-enter min-h-screen px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <GlassCard>
          <GradientHeading>TalentBridge AI</GradientHeading>
          <p className="mt-2 text-sm text-slate-600">
            AI-powered skill gap analysis with upload + text fallback.
          </p>
        </GlassCard>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="space-y-4">
            <GradientHeading className="text-2xl">Resume</GradientHeading>
            <UploadBox label="Upload resume file" onTextParsed={setResume} />
            <textarea
              className="min-h-56 rounded-xl border border-white/70 bg-white/70 p-3 text-sm outline-none transition focus:border-pink-300"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste resume text..."
            />
          </GlassCard>

          <GlassCard className="space-y-4">
            <GradientHeading className="text-2xl">Job Description</GradientHeading>
            <UploadBox label="Upload job description file" onTextParsed={setJobDescription} />
            <textarea
              className="min-h-56 rounded-xl border border-white/70 bg-white/70 p-3 text-sm outline-none transition focus:border-pink-300"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste JD text..."
            />
          </GlassCard>
        </div>

        <GlassCard className="flex flex-wrap items-center gap-4">
          <button
            className="rounded-xl bg-gradient-to-r from-[#6b8e23] via-[#ec4899] to-[#eab308] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] disabled:opacity-60"
            disabled={isLoading}
            onClick={analyze}
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            className="rounded-xl bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={() => {
              resetState();
              setResume(SAMPLE_RESUME);
              setJobDescription(SAMPLE_JD);
            }}
          >
            Reset
          </button>
          <button
            className="rounded-xl bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-60"
            onClick={() => void runHealthCheck()}
            disabled={isCheckingHealth}
          >
            {isCheckingHealth ? "Checking APIs..." : "Run Health Check"}
          </button>
        </GlassCard>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">{error}</p> : null}

        {healthReport ? (
          <GlassCard>
            <GradientHeading className="text-2xl">API Health Report</GradientHeading>
            <div className="mt-4 space-y-2 text-sm">
              {healthReport.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
                  <span>{item.name}</span>
                  <span className={item.ok ? "text-emerald-700" : "text-rose-700"}>
                    {item.ok ? "PASS" : `FAIL: ${item.detail}`}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        ) : null}
      </div>
    </main>
  );
}
