import type { ReactNode } from "react";

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-white/60 bg-white/40 p-6 shadow-lg backdrop-blur-lg transition hover:bg-white/50 ${className}`}
    >
      {children}
    </section>
  );
}
