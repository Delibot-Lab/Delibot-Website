"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { Post } from "@/lib/posts";

const MarkdownEditor = dynamic(
  () => import("./MarkdownEditor").then((m) => m.MarkdownEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-border bg-bg text-sm text-muted">
        에디터를 불러오는 중...
      </div>
    ),
  }
);

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-mint";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-navy">
      {label}
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

export function PostForm({
  mode,
  initialPost,
}: {
  mode: "create" | "edit";
  initialPost?: Post;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [date, setDate] = useState(
    initialPost?.date || new Date().toISOString().slice(0, 10)
  );
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [author, setAuthor] = useState(
    initialPost?.author || "CBSH DeliBot Lab"
  );
  const [tags, setTags] = useState(initialPost?.tags.join(", ") ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      date,
      excerpt: excerpt.trim(),
      author: author.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      content,
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/posts/${initialPost?.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "저장에 실패했습니다.");
        return;
      }

      router.push(`/blog/${data.slug}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialPost) return;
    if (!confirm("정말 이 글을 삭제할까요?")) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${initialPost.slug}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "삭제에 실패했습니다.");
        return;
      }
      router.push("/blog");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="제목">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="slug"
          hint="영문 소문자, 숫자, 하이픈만 (예: stm32-brain-of-delibot)"
        >
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="stm32-brain-of-delibot"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="날짜">
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="작성자">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="태그" hint="쉼표로 구분">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="firmware, control-systems"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="요약">
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-navy">본문 (Markdown)</p>
          <div className="flex gap-1 rounded-full bg-surface p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`rounded-full px-3 py-1.5 ${
                tab === "write" ? "bg-bg text-navy shadow-sm" : "text-muted"
              }`}
            >
              작성
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`rounded-full px-3 py-1.5 ${
                tab === "preview" ? "bg-bg text-navy shadow-sm" : "text-muted"
              }`}
            >
              미리보기
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">
          수식은{" "}
          <code className="rounded bg-surface px-1 py-0.5 font-mono">
            $E=mc^2$
          </code>
          (인라인) 또는{" "}
          <code className="rounded bg-surface px-1 py-0.5 font-mono">
            $$ \int_0^1 x^2 dx $$
          </code>
          (블록, 한 줄로) 처럼 씁니다. $$ 사이를 줄바꿈하면 편집기에서 깨지니 한 줄로 써주세요. 편집
          중엔 텍스트 그대로 보이고, 미리보기와 실제 글에서 수식으로 렌더링돼요.
        </p>

        {tab === "write" ? (
          <div className="mt-2">
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-border bg-bg p-6">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-sm text-muted">미리볼 내용이 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? "저장 중..." : mode === "create" ? "발행하기" : "수정 저장"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-danger px-6 py-3 text-sm font-semibold text-danger disabled:opacity-60"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        )}
      </div>
    </form>
  );
}
