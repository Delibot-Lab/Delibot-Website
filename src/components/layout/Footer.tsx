"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  const en = pathname === "/en" || pathname.startsWith("/en/");
  return (
    <footer className="border-t border-black/[.05] bg-white">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-2xl font-extrabold tracking-[-.03em] text-[#191f28]">{siteConfig.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {en ? "An autonomous campus delivery robot built by CBSH DeliBot Lab." : siteConfig.description}
            </p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-4 inline-block text-sm font-medium text-navy hover:text-mint-strong"
            >
              {siteConfig.contactEmail}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {en ? "Site" : "사이트"}
              </p>
              <ul className="mt-3 space-y-2">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink hover:text-mint-strong"
                    >
                      {en ? ({ 소개: "About", 블로그: "Stories", "팀원 모집": "Join" } as Record<string, string>)[item.label] ?? item.label : item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {en ? "Projects" : "프로젝트"}
              </p>
              <ul className="mt-3 space-y-2">
                {siteConfig.repos.map((repo) => (
                  <li key={repo.url}>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-ink hover:text-mint-strong"
                    >
                      {repo.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.labName}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="font-medium text-navy hover:text-mint-strong">
              {en ? "Privacy" : "개인정보 안내"}
            </Link>
            <a
              href={siteConfig.githubOrgUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-navy hover:text-mint-strong"
            >
              GitHub Organization →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
