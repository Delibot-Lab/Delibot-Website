import type { LucideIcon } from "lucide-react";

const bgMap = {
  mint: "bg-mint/15",
  peach: "bg-peach/25",
  teal: "bg-teal/15",
} as const;

const iconColorMap = {
  mint: "text-mint-strong",
  peach: "text-peach-strong",
  teal: "text-teal",
} as const;

export function IconBadge({
  icon: Icon,
  color = "mint",
  className = "",
}: {
  icon: LucideIcon;
  color?: keyof typeof bgMap;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${bgMap[color]} ${className}`}
    >
      <Icon className={`h-6 w-6 ${iconColorMap[color]}`} strokeWidth={1.75} />
    </span>
  );
}
