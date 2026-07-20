export function Card({
  children,
  className = "",
  tone = "surface",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "surface" | "bg";
}) {
  const toneClass = tone === "bg" ? "bg-bg" : "bg-surface";
  return (
    <div
      className={`rounded-3xl border border-border ${toneClass} p-6 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
