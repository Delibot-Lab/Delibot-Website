"use client";

import { useCurrentUser } from "@/lib/supabase/useCurrentUser";

/** 정적/ISR 캐시되는 페이지에서 "로그인한 회원 전용" UI를 안전하게 보여주기 위한 래퍼. */
export function MemberOnly({ children }: { children: React.ReactNode }) {
  const { authenticated } = useCurrentUser();
  if (!authenticated) return null;
  return <>{children}</>;
}
