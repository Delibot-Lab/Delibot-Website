const colorMap = {
  mint: "bg-mint/15 text-mint-strong",
  peach: "bg-peach/25 text-peach-strong",
  teal: "bg-teal/15 text-teal",
} as const;

export function Badge({
  children,
  color = "mint",
}: {
  children: React.ReactNode;
  color?: keyof typeof colorMap;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colorMap[color]}`}
    >
      {children}
    </span>
  );
}
