"use client";

import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-full overflow-hidden">
      <div
        key={pathname}
        className="route-progress h-full w-full origin-left bg-gradient-to-r from-[#6b8e23] via-[#ec4899] to-[#eab308] shadow-[0_0_12px_rgba(236,72,153,0.55)]"
      />
    </div>
  );
}
