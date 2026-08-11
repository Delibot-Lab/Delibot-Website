"use client";

import { useState, type SyntheticEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const SCHOOL_DOMAIN = "@cbs-h.cbe.go.kr";
const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-mint";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith(SCHOOL_DOMAIN)) {
      setError(`학교 이메일(${SCHOOL_DOMAIN})로만 가입할 수 있어요.`);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, birthday } },
      });

      if (signUpError) {
        setError(signUpError.message);
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
          <strong>{email}</strong>로 확인 메일을 보냈어요.
        </p>
        <p className="mt-2 text-xs text-muted">
          메일의 링크를 눌러 인증을 마치면 5시간 안에 동아리 지원서를 제출해야 가입이 완료돼요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-navy">
          이름
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="birthday" className="text-sm font-medium text-navy">
          생년월일
        </label>
        <input
          id="birthday"
          type="date"
          required
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted">
          학번은 졸업하면 사라지니, 생년월일을 회원 식별 정보로 사용해요.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-navy">
          학교 이메일
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder={`example${SCHOOL_DOMAIN}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-navy">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {loading ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
