import type { NextConfig } from "next";

const baseDirectives = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  // 블로그 글은 마크다운으로 자유롭게 작성되고, 실제로 Naver/Giphy/Pinterest/GitHub 등
  // 임의의 외부 호스트 이미지를 그대로 붙여넣은 기존 글이 있다. 특정 호스트로
  // 제한하면 이미 발행된 글이 깨지므로 https 이미지는 호스트 제한 없이 허용한다.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://raw.githubusercontent.com",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

// 사이트 전역: eval() 계열을 막는 엄격한 CSP.
const csp = [
  ...baseDirectives,
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
].join("; ");

// /wasm/*만 예외: occt-import-js(Emscripten WASM 글루 코드)가 초기화 중
// 문자열 eval을 사용해서 'wasm-unsafe-eval'만으로는 부족하다. 사이트 전체
// 정책을 풀어주는 대신 이 정적 스크립트 경로에만 unsafe-eval을 허용한다.
const wasmCsp = [
  ...baseDirectives,
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
].join("; ");

const commonHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/wasm/:path*",
        headers: [{ key: "Content-Security-Policy", value: wasmCsp }, ...commonHeaders],
      },
      {
        source: "/((?!wasm/).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }, ...commonHeaders],
      },
    ];
  },
};

export default nextConfig;
