"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

type AuthState = {
  loading: boolean;
  authenticated: boolean;
  isAdmin: boolean;
};

const INITIAL_STATE: AuthState = {
  loading: true,
  authenticated: false,
  isAdmin: false,
};

/** 클라이언트 컴포넌트에서 로그인/admin 여부를 구독한다 (정적/ISR 캐시된 페이지 대응용). */
export function useCurrentUser(): AuthState {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    function refresh() {
      supabase.auth.getClaims().then(({ data }) => {
        if (cancelled) return;
        const claims = data?.claims;
        setState({
          loading: false,
          authenticated: !!claims,
          isAdmin: claims?.app_metadata?.is_admin === true,
        });
      });
    }

    refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => refresh());

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
