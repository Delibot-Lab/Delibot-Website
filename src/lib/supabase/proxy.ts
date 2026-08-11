import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isAdminPath(pathname: string): boolean {
  if (pathname === "/blog/write" || pathname === "/admin") return true;
  if (pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/api/posts")) return true;
  return /^\/blog\/[^/]+\/edit$/.test(pathname);
}

function isLoginRequiredPath(pathname: string): boolean {
  return pathname === "/join" || pathname === "/api/apply";
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // createServerClient와 getClaims() 사이에는 아무 코드도 넣지 않는다 (세션이
  // 예기치 않게 끊길 수 있음). getSession()은 서버 코드에서 신뢰하면 안 되고,
  // JWT 서명을 매번 검증하는 getClaims()만 사용한다.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const pathname = request.nextUrl.pathname;
  const isAdmin = claims?.app_metadata?.is_admin === true;

  const needsAdmin = isAdminPath(pathname);
  const needsLogin = isLoginRequiredPath(pathname);

  if ((needsAdmin && !isAdmin) || (needsLogin && !claims)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
