"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { siteConfig } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/supabase/useCurrentUser";

const navTranslations: Record<string, string> = {
  소개: "About",
  블로그: "Stories",
  "팀원 모집": "Join",
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { authenticated, isAdmin } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const isImmersivePage = pathname === "/" || pathname === "/en";
  const languageHref = isEnglish
    ? pathname.replace(/^\/en(?=\/|$)/, "") || "/"
    : pathname.startsWith("/team/") ? `/en${pathname}` : "/en";
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 420], [0, -76]);
  const headerOpacity = useTransform(scrollY, [0, 280], [1, 0]);

  async function handleLogout() {
    await createClient().auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <motion.header style={isImmersivePage ? { y: headerY, opacity: headerOpacity } : { y: 0, opacity: 1 }} className="sticky top-0 z-50 border-b border-black/[.055] bg-white/92 backdrop-blur-2xl">
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-10 xl:px-16">
        <Link href={isEnglish ? "/en" : "/"} className="flex w-fit items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/delibot-logo.png"
            alt="Delibot"
            width={30}
            height={30}
            className="rounded-[10px]"
            priority
          />
          <span className="text-[17px] font-extrabold tracking-[-.025em] text-[#202a32]">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[#59636d] transition-colors hover:text-[#171d22]"
            >
              {isEnglish ? (navTranslations[item.label] ?? item.label) : item.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden items-center justify-end gap-5 md:flex">
          <Link href={languageHref} className="text-sm font-semibold text-[#59636d] transition hover:text-[#171d22]" aria-label={isEnglish ? "한국어로 보기" : "View in English"}>
            {isEnglish ? "KOR" : "ENG"}
          </Link>
          <a
            href={siteConfig.githubOrgUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#f2f4f5] px-4 py-2 text-sm font-bold text-[#36414a] transition hover:bg-[#e7ebed]"
          >
            GitHub
          </a>
          {authenticated && (
            <Link
              href="/chat"
              className="text-sm font-medium text-[#59636d] transition-colors hover:text-[#171d22]"
            >
              {isEnglish ? "Chat" : "채팅"}
            </Link>
          )}
          {authenticated && (
            <Link
              href="/profile"
              className="text-sm font-medium text-[#59636d] transition-colors hover:text-[#171d22]"
            >
              {isEnglish ? "Profile" : "내 프로필"}
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-[#59636d] transition-colors hover:text-[#171d22]"
            >
              {isEnglish ? "Admin" : "관리자"}
            </Link>
          )}
          {authenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-[#59636d] transition-colors hover:text-danger"
            >
              {isEnglish ? "Log out" : "로그아웃"}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-[#59636d] transition-colors hover:text-[#171d22]"
            >
              {isEnglish ? "Log in" : "로그인"}
            </Link>
          )}
        </nav>

        <button
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-nav"
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
        <nav id="mobile-nav" className="flex flex-col gap-1 border-t border-border/70 bg-bg px-5 py-3 md:hidden">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {isEnglish ? (navTranslations[item.label] ?? item.label) : item.label}
            </Link>
          ))}
          <Link href={languageHref} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-bold text-mint-strong hover:bg-surface">{isEnglish ? "한국어 (KOR)" : "English (ENG)"}</Link>
          <a
            href={siteConfig.githubOrgUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
          >
            GitHub
          </a>
          {authenticated && (
            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {isEnglish ? "Chat" : "채팅"}
            </Link>
          )}
          {authenticated && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {isEnglish ? "Profile" : "내 프로필"}
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {isEnglish ? "Admin" : "관리자"}
            </Link>
          )}
          {authenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-surface"
            >
              {isEnglish ? "Log out" : "로그아웃"}
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {isEnglish ? "Log in" : "로그인"}
            </Link>
          )}
        </nav>
      )}
    </motion.header>
  );
}
