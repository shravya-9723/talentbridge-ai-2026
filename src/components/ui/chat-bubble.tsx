export function ChatBubble({ role, text }: { role: "ai" | "user"; text: string }) {
  const isAI = role === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md ${
          isAI ? "bg-white/70 text-slate-800" : "bg-gradient-to-r from-pink-500 to-amber-400 text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
