"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TeamProfile } from "@/lib/team";
import { siteConfig } from "@/lib/site";

const inputClass = "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-mint";

export function PublicProfileEditor({ userId, name, email, avatarUrl, initial }: { userId: string; name: string; email: string; avatarUrl: string | null; initial: TeamProfile | null }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const slug = text("slug").toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError("프로필 주소는 영문 소문자, 숫자, 하이픈만 사용할 수 있어요.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: userId,
      slug,
      display_name: text("display_name"),
      role_ko: text("role_ko"),
      role_en: text("role_en"),
      teams: form.getAll("teams").map(String),
      bio_ko: text("bio_ko"),
      bio_en: text("bio_en"),
      skills: text("skills").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12),
      avatar_url: avatarUrl,
      contact_email: text("contact_email") || null,
      orcid: text("orcid") || null,
      linkedin_url: text("linkedin_url") || null,
      github_url: text("github_url") || null,
      website_url: text("website_url") || null,
      is_public: form.get("is_public") === "on",
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = await createClient().from("team_profiles").upsert(payload, { onConflict: "user_id" });
    if (saveError) setError(saveError.code === "23505" ? "이미 사용 중인 프로필 주소예요." : saveError.message);
    else setMessage("공개 프로필을 저장했습니다.");
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-3xl border border-border bg-surface p-6 md:p-8">
      <div className="mb-7 flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-extrabold tracking-[.16em] text-mint-strong">PUBLIC PROFILE</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy">팀원 공개 프로필</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">홈의 팀 섹션과 개인 프로필 페이지에 표시될 내용입니다. 이메일과 생년월일은 공개되지 않습니다.</p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 text-sm font-semibold text-navy">
          <input name="is_public" type="checkbox" defaultChecked={initial?.is_public} className="accent-[#39b98a]" />
          {initial?.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} 공개
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="표시 이름" name="display_name" required defaultValue={initial?.display_name ?? name} />
        <Field label="프로필 주소" name="slug" required minLength={3} placeholder="hong-gildong" defaultValue={initial?.slug ?? ""} hint="delibot.kr/team/hong-gildong 형태로 사용됩니다." />
        <Field label="역할 (한국어)" name="role_ko" placeholder="자율주행 엔지니어" defaultValue={initial?.role_ko ?? ""} />
        <Field label="Role (English)" name="role_en" placeholder="Autonomy Engineer" defaultValue={initial?.role_en ?? ""} />
        <Field label="기술 태그" name="skills" placeholder="ROS 2, C++, SLAM" defaultValue={initial?.skills.join(", ") ?? ""} hint="쉼표로 구분해 주세요." />
      </div>
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-navy">소속 팀</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {siteConfig.recruitTeams.map((team) => (
            <label key={team.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg px-3 py-3 text-sm font-medium text-navy">
              <input type="checkbox" name="teams" value={team.label} defaultChecked={initial?.teams.includes(team.label)} className="accent-[#39b98a]" />
              {team.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <TextArea label="소개 (한국어)" name="bio_ko" defaultValue={initial?.bio_ko ?? ""} />
        <TextArea label="Bio (English)" name="bio_en" defaultValue={initial?.bio_en ?? ""} />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label="공개 연락 이메일" name="contact_email" type="email" placeholder="me@example.com" defaultValue={initial?.contact_email ?? email} hint="개인 소개 페이지에 표시할 이메일입니다." />
        <Field label="GitHub" name="github_url" type="url" placeholder="https://github.com/..." defaultValue={initial?.github_url ?? ""} />
        <Field label="LinkedIn" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." defaultValue={initial?.linkedin_url ?? ""} />
        <Field label="ORCID" name="orcid" placeholder="0000-0000-0000-0000" defaultValue={initial?.orcid ?? ""} />
        <Field label="웹사이트" name="website_url" type="url" placeholder="https://..." defaultValue={initial?.website_url ?? ""} />
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "저장 중..." : "프로필 저장"}</button>
        {message && <p className="inline-flex items-center gap-1.5 text-sm font-medium text-mint-strong"><Check className="h-4 w-4" />{message}</p>}
        {error && <p className="text-sm font-medium text-danger">{error}</p>}
      </div>
    </form>
  );
}

function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="text-sm font-semibold text-navy">{label}<input {...props} className={inputClass} />{hint && <span className="mt-1.5 block text-xs font-normal text-muted">{hint}</span>}</label>;
}

function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className="text-sm font-semibold text-navy">{label}<textarea {...props} rows={5} maxLength={1200} className={`${inputClass} resize-y`} /></label>;
}
