"use client";

import { useState, type SyntheticEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-mint";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteConfig.url}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-navy">
          <strong>{email}</strong>로 비밀번호 재설정 메일을 보냈어요.
        </p>
        <p className="mt-2 text-xs text-muted">
          메일이 안 보이면 스팸함도 확인해주세요. 가입한 이메일이 아니라면 메일이 오지 않아요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-navy">
          가입한 이메일
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

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {loading ? "전송 중..." : "재설정 메일 보내기"}
      </button>

      <a href="/login" className="text-center text-xs text-muted hover:text-navy">
        로그인으로 돌아가기
      </a>
    </form>
  );
}
