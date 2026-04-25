"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppState } from "@/lib/app-state";
import { initialAppState } from "@/lib/app-state";

interface AppStateContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  resetState: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") return initialAppState;
    const raw = sessionStorage.getItem("talentbridge-state");
    if (!raw) return initialAppState;
    try {
      return JSON.parse(raw) as AppState;
    } catch {
      return initialAppState;
    }
  });

  useEffect(() => {
    sessionStorage.setItem("talentbridge-state", JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      setState,
      resetState: () => setState(initialAppState),
    }),
    [state],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
