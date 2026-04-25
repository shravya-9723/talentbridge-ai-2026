export function GradientHeading({ children, className = "" }: { children: string; className?: string }) {
  return (
    <h1
      className={`bg-gradient-to-r from-[#6b8e23] via-[#ec4899] to-[#eab308] bg-clip-text text-3xl font-bold text-transparent ${className}`}
    >
      {children}
    </h1>
  );
}
