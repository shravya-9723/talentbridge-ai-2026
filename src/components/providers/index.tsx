"use client";

import { AppStateProvider } from "@/components/providers/app-state-provider";
import { RouteProgress } from "@/components/ui/route-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <RouteProgress />
      {children}
    </AppStateProvider>
  );
}
