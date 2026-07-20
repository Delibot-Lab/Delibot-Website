"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-mint";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-navy">
      {label}
      {children}
    </label>
  );
}

export function JoinForm() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  function toggleTeam(label: string) {
    setTeams((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (teams.length === 0) {
      setError("지원 분야를 하나 이상 선택해주세요.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, studentId, phone, teams, motivation }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "지원서 전송에 실패했습니다.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("지원서 전송에 실패했습니다.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-border bg-surface p-10 text-center">
        <p className="text-lg font-bold text-navy">지원서가 접수되었습니다!</p>
        <p className="mt-2 text-sm text-muted">
          빠른 시일 내에 연락드릴게요. 급한 문의는{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-mint-strong"
          >
            {siteConfig.contactEmail}
          </a>
          로 보내주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="이름">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="학번">
          <input
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="연락처 (전화번호)">
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          className={inputClass}
        />
      </Field>

      <div>
        <p className="text-sm font-medium text-navy">지원 분야</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {siteConfig.recruitTeams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => toggleTeam(team.label)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                teams.includes(team.label)
                  ? "border-mint bg-mint/15 text-mint-strong"
                  : "border-border bg-bg text-muted"
              }`}
            >
              <team.icon aria-hidden className="h-4 w-4" />
              {team.label}
            </button>
          ))}
        </div>
      </div>

      <Field label="지원 동기 및 자기소개">
        <textarea
          required
          rows={6}
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className={inputClass}
        />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "loading" ? "전송 중..." : "지원서 제출"}
      </button>
    </form>
  );
}
