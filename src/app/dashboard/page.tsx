"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { Document, ExternalHyperlink, Packer, Paragraph, TextRun } from "docx";
import { useAppState } from "@/components/providers/app-state-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function DashboardPage() {
  const router = useRouter();
  const { state, resetState } = useAppState();

  useEffect(() => {
    if (!state.answers.length || !state.learningPlan) {
      router.replace("/");
    }
  }, [router, state.answers.length, state.learningPlan]);

  const averageScore = useMemo(() => {
    if (!state.answers.length) return 0;
    const total = state.answers.reduce((sum, item) => sum + item.evaluation.finalScore, 0);
    return Number((total / state.answers.length).toFixed(2));
  }, [state.answers]);

  function buildReportLines() {
    const missing = state.matchedSkills.filter((s) => s.status === "missing");
    return [
      "TalentBridge AI - Skill Gap Report",
      `Overall Score: ${averageScore}/10`,
      `Required Skills: ${state.requiredSkills.length}`,
      `Missing Skills: ${missing.length}`,
      "",
      "Skill Scores:",
      ...state.answers.map(
        (entry, i) => `${i + 1}. ${entry.skill} -> ${entry.evaluation.finalScore}/10 (${entry.evaluation.category})`,
      ),
      "",
      "Direct Gaps (Missing):",
      ...(missing.length ? missing.map((s, i) => `${i + 1}. ${s.skill} (importance ${s.importance}/10)`) : ["None"]),
      "",
      "Improvement Gaps (Weak):",
      ...(state.weakSkills.length
        ? state.weakSkills.map((s, i) => `${i + 1}. ${s.skill} (score ${s.finalScore}/10)`)
        : ["None"]),
      "",
      `Learning Plan (${state.learningPlan?.totalDays ?? 0} days):`,
      ...(state.learningPlan?.days.map(
        (day) => `Day ${day.day}: ${day.focus} | Adjacent: ${day.adjacentSkills.join(", ")} | ${day.estimatedMinutes} mins`,
      ) ?? []),
    ];
  }

  function getResourceLinks() {
    const seen = new Set<string>();
    const resources = state.learningPlan?.days.flatMap((day) => day.resources) ?? [];
    return resources.filter((resource) => {
      if (seen.has(resource.url)) return false;
      seen.add(resource.url);
      return true;
    });
  }

  function downloadPdf() {
    const lines = buildReportLines();
    const resources = getResourceLinks();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 50;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 520);
      wrapped.forEach((segment: string) => {
        if (y > 800) {
          doc.addPage();
          y = 50;
        }
        doc.text(segment, 40, y);
        y += 16;
      });
    });

    if (y > 760) {
      doc.addPage();
      y = 50;
    }
    y += 8;
    doc.setTextColor(20, 20, 20);
    doc.text("Resources (Clickable Links):", 40, y);
    y += 18;

    resources.forEach((resource, index) => {
      if (y > 800) {
        doc.addPage();
        y = 50;
      }
      const linkText = `${index + 1}. ${resource.title}`;
      doc.setTextColor(37, 99, 235);
      doc.textWithLink(linkText, 40, y, { url: resource.url });
      doc.setTextColor(20, 20, 20);
      y += 16;
    });

    doc.save("talentbridge-report.pdf");
  }

  async function downloadDocx() {
    const lines = buildReportLines();
    const resources = getResourceLinks();
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            ...lines.map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line })],
                }),
            ),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
            new Paragraph({
              children: [new TextRun({ text: "Resources (Clickable Links):", bold: true })],
            }),
            ...resources.map(
              (resource, index) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `${index + 1}. ` }),
                    new ExternalHyperlink({
                      link: resource.url,
                      children: [
                        new TextRun({
                          text: resource.title,
                          style: "Hyperlink",
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "talentbridge-report.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!state.learningPlan || !state.answers.length) {
    return (
      <main className="min-h-screen p-6">
        <GlassCard className="mx-auto max-w-5xl">Loading dashboard...</GlassCard>
      </main>
    );
  }

  return (
    <main className="animate-enter min-h-screen px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <GlassCard>
          <GradientHeading>Results Dashboard</GradientHeading>
        </GlassCard>

        <section className="grid gap-6 md:grid-cols-3">
          <MetricCard label="Overall Score" value={averageScore.toString()} />
          <MetricCard label="Required Skills" value={String(state.requiredSkills.length)} />
          <MetricCard label="Missing Skills" value={String(state.matchedSkills.filter((s) => s.status === "missing").length)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h2 className="text-lg font-semibold text-slate-800">Skill Scores</h2>
            <div className="mt-4 space-y-3">
              {state.answers.slice(0, 18).map((entry, idx) => (
                <div key={`${entry.skill}-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{entry.skill}</span>
                    <span className="font-medium">{entry.evaluation.finalScore}/10</span>
                  </div>
                  <ProgressBar value={entry.evaluation.finalScore * 10} />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold text-slate-800">Skill Gaps</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-rose-700">Direct Gaps (Missing Skills)</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {state.matchedSkills.filter((skill) => skill.status === "missing").length ? (
                    state.matchedSkills
                      .filter((skill) => skill.status === "missing")
                      .map((skill) => (
                        <li key={skill.skill} className="rounded-lg bg-rose-100/80 px-3 py-2">
                          {skill.skill} (importance {skill.importance}/10)
                        </li>
                      ))
                  ) : (
                    <li className="rounded-lg bg-emerald-100/70 px-3 py-2 text-emerald-700">No direct gaps detected.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-700">Improvement Gaps (Weak Skills)</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {state.weakSkills.length ? (
                    state.weakSkills.map((skill) => (
                      <li key={skill.skill} className="rounded-lg bg-yellow-100/80 px-3 py-2">
                        {skill.skill} (score {skill.finalScore}/10)
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg bg-emerald-100/70 px-3 py-2 text-emerald-700">
                      No weak areas based on submitted answers.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h2 className="text-lg font-semibold">Learning Plan ({state.learningPlan.totalDays} days)</h2>
            <p className="mt-2 text-sm text-slate-600">
              Includes adjacent skills, realistic time estimates, and curated resources (YouTube + docs).
            </p>
            <div className="mt-4 space-y-3">
              {state.learningPlan.days.map((day) => (
                <div key={day.day} className="rounded-xl border border-white/70 bg-white/40 p-4">
                  <p className="text-sm font-semibold">
                    Day {day.day}: {day.focus}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Adjacent: {day.adjacentSkills.join(", ")} • {day.estimatedMinutes} mins
                  </p>
                  <ul className="mt-2 space-y-1 text-xs">
                    {day.resources.map((resource) => (
                      <li key={`${day.day}-${resource.url}`} className="text-slate-700">
                        <a className="text-indigo-600 hover:underline" href={resource.url} target="_blank" rel="noreferrer">
                          {resource.title}
                        </a>{" "}
                        ({resource.type}, {resource.estimatedMinutes} mins)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold">Resources</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {state.learningPlan.days
                .flatMap((day) => day.resources)
                .slice(0, 16)
                .map((resource) => (
                  <li key={resource.url} className="rounded-lg bg-white/60 p-3">
                    <a className="font-medium text-pink-600 hover:underline" href={resource.url} target="_blank" rel="noreferrer">
                      {resource.title}
                    </a>
                    <span className="ml-2 text-xs text-slate-600">
                      ({resource.type}, {resource.estimatedMinutes} mins)
                    </span>
                  </li>
                ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Tip: Open 2-3 resources daily and track progress as mini checkpoints.
            </p>
            <button
              className="mt-5 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              onClick={() => {
                resetState();
                router.push("/");
              }}
            >
              Start New Analysis
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                onClick={downloadPdf}
              >
                Download PDF
              </button>
              <button
                className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                onClick={() => void downloadDocx()}
              >
                Download DOCX
              </button>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </GlassCard>
  );
}
