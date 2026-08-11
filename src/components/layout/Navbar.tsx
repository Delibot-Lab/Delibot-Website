"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/supabase/useCurrentUser";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { authenticated, isAdmin } = useCurrentUser();
  const router = useRouter();

  async function handleLogout() {
    await createClient().auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/delibot-logo.png"
            alt="Delibot"
            width={36}
            height={36}
            className="rounded-xl"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-navy">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.githubOrgUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            GitHub
          </a>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-muted transition-colors hover:text-navy"
            >
              관리자
            </Link>
          )}
          {authenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-muted transition-colors hover:text-danger"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted transition-colors hover:text-navy"
            >
              로그인
            </Link>
          )}
        </nav>

        <button
          type="button"
          aria-label="메뉴 열기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-navy md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border/70 bg-bg px-5 py-3 md:hidden">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.githubOrgUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
          >
            GitHub
          </a>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              관리자
            </Link>
          )}
          {authenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-surface"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              로그인
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
