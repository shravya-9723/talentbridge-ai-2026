import { GlassCard } from "@/components/ui/glass-card";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <GlassCard className="space-y-3">
          <SkeletonBlock className="h-8 w-64" />
        </GlassCard>
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard><SkeletonBlock className="h-20 w-full" /></GlassCard>
          <GlassCard><SkeletonBlock className="h-20 w-full" /></GlassCard>
          <GlassCard><SkeletonBlock className="h-20 w-full" /></GlassCard>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="space-y-3">
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
          </GlassCard>
          <GlassCard className="space-y-3">
            <SkeletonBlock className="h-6 w-28" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
