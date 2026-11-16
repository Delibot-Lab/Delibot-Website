import "server-only";
import { headers } from "next/headers";

const baseUrl = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8080";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const incoming = await headers();
  const requestHeaders = new Headers(init.headers);
  const cookie = incoming.get("cookie");
  if (cookie) requestHeaders.set("cookie", cookie);
  return fetch(`${baseUrl}${path}`, { ...init, headers: requestHeaders, cache: "no-store" });
}

export type CurrentUser = { id: string; email: string; name: string; isAdmin: boolean };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await apiFetch("/api/v1/auth/me");
    if (!response.ok) return null;
    return (await response.json()).user ?? null;
  } catch {
    return null;
  }
}
