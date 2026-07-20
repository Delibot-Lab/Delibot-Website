import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-navy ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
