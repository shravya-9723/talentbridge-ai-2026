export function ProgressBar({ value }: { value: number }) {
  const normalized = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full rounded-full bg-white/60">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-[#6b8e23] via-[#ec4899] to-[#eab308] transition-all duration-500"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
