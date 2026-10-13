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
      className={`rounded-[2rem] border border-black/[.04] ${toneClass} p-6 shadow-[0_18px_50px_-38px_rgba(25,31,40,.32)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_26px_65px_-40px_rgba(25,31,40,.4)] md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
