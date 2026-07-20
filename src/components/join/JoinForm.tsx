"use client";

import { useState, type SyntheticEvent } from "react";
import { siteConfig } from "@/lib/site";

const SLACK_INVITE_URL =
  "https://join.slack.com/t/delibotlab/shared_invite/zt-448hue1kz-5k02ynItENMFNEUNhFw60g";

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
  const [githubId, setGithubId] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [slackJoined, setSlackJoined] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  function toggleTeam(label: string) {
    setTeams((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  }

  const isComplete =
    name.trim() !== "" &&
    studentId.trim() !== "" &&
    phone.trim() !== "" &&
    githubId.trim() !== "" &&
    teams.length > 0 &&
    motivation.trim() !== "" &&
    slackJoined;

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (teams.length === 0) {
      setError("지원 분야를 하나 이상 선택해주세요.");
      return;
    }
    if (!slackJoined) {
      setError("Slack 가입 여부를 확인해주세요.");
      return;
    }
    if (!isComplete) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          studentId,
          phone,
          githubId,
          teams,
          motivation,
          slackJoined,
        }),
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

      <div className="grid gap-5 sm:grid-cols-2">
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
        <Field label="GitHub 아이디">
          <input
            required
            value={githubId}
            onChange={(e) => setGithubId(e.target.value)}
            placeholder="github.com/아이디"
            className={inputClass}
          />
        </Field>
      </div>

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

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-navy">Slack 가입</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          아래 링크로 랩 Slack에 가입해주세요.{" "}
          <span className="font-semibold text-navy">
            반드시 본인 실명으로 가입
          </span>
          해야 합니다.
        </p>
        <a
          href={SLACK_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          Slack 가입하러 가기
        </a>
        <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            required
            checked={slackJoined}
            onChange={(e) => setSlackJoined(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-mint"
          />
          실명으로 Slack에 가입했습니다.
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading" || !isComplete}
        className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "전송 중..." : "지원서 제출"}
      </button>
    </form>
  );
}
