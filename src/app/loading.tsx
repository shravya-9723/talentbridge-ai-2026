import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <GlassCard className="space-y-3">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-80" />
        </GlassCard>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="space-y-4">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-56 w-full" />
          </GlassCard>
          <GlassCard className="space-y-4">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-56 w-full" />
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
