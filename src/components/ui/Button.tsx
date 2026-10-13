import Link from "next/link";

const variantMap = {
  primary: "bg-mint-strong text-white shadow-[0_10px_25px_-14px_rgba(61,131,102,.75)] hover:bg-[#327158]",
  secondary: "bg-mint text-[#173b2e]",
  ghost: "border border-black/[.06] bg-white text-navy shadow-sm",
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
  const cls = `inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${variantMap[variant]} ${className}`;

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
