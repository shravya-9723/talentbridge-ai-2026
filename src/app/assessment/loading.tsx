import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <GlassCard className="space-y-3">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-4 w-72" />
        </GlassCard>
        <GlassCard className="space-y-4">
          <SkeletonBlock className="h-14 w-4/5" />
          <SkeletonBlock className="h-14 w-3/5 ml-auto" />
          <SkeletonBlock className="h-36 w-full" />
          <SkeletonBlock className="h-10 w-40 ml-auto" />
        </GlassCard>
      </div>
    </main>
  );
}
