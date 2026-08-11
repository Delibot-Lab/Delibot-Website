"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-base outline-none focus:border-mint";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const confirmFailed = searchParams.get("error") === "confirm_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    confirmFailed ? "이메일 인증 링크가 만료되었거나 올바르지 않습니다." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-navy">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-navy">
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <a href="/forgot-password" className="-mt-2 text-right text-xs text-muted hover:text-navy">
        비밀번호를 잊으셨나요?
      </a>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {loading ? "확인 중..." : "로그인"}
      </button>

      <a href="/signup" className="text-center text-xs text-muted hover:text-navy">
        아직 회원이 아니신가요? 회원가입
      </a>
    </form>
  );
}
