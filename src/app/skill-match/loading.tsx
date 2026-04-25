import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <GlassCard className="space-y-3">
          <SkeletonBlock className="h-8 w-72" />
          <SkeletonBlock className="h-4 w-96" />
        </GlassCard>
        <GlassCard className="space-y-3">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </GlassCard>
      </div>
    </main>
  );
}
