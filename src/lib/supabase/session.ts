import { createClient } from "./server";

export type CurrentUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

/** Server Component / Route Handler 전용. JWT 서명을 매번 검증하는 getClaims()를 쓴다 (getSession()은 신뢰하지 말 것). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  return {
    id: claims.sub as string,
    email: (claims.email as string) ?? "",
    isAdmin: claims.app_metadata?.is_admin === true,
  };
}
