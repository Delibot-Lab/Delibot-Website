"use client";

import { useEffect, useState } from "react";

type AuthState = { loading: boolean; authenticated: boolean; isAdmin: boolean };
const INITIAL_STATE: AuthState = { loading: true, authenticated: false, isAdmin: false };

export function useCurrentUser(): AuthState {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/auth/me", { credentials: "include", cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : { user: null })
      .then(({ user }) => {
        if (!cancelled) setState({ loading: false, authenticated: !!user, isAdmin: user?.isAdmin === true });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, authenticated: false, isAdmin: false });
      });
    return () => { cancelled = true; };
  }, []);
  return state;
}
