"use client";

import { useCurrentUser } from "@/lib/supabase/useCurrentUser";

/**
 * 정적/ISR 캐시되는 페이지에서 관리자 전용 UI를 안전하게 보여주기 위한 래퍼.
 * 서버에서 cookies()로 분기하면 캐시된 HTML이 모든 방문자에게 그대로 나갈 수 있어
 * 마운트 후 클라이언트에서 세션을 확인해 렌더링한다.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useCurrentUser();
  if (!isAdmin) return null;
  return <>{children}</>;
}
