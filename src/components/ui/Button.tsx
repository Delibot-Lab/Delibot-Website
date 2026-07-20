import Link from "next/link";

const variantMap = {
  primary: "bg-navy text-white",
  secondary: "bg-mint text-white",
  ghost: "border border-border bg-surface text-navy",
} as const;

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variantMap;
  external?: boolean;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] ${variantMap[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
