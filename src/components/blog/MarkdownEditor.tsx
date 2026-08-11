"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  Loader2,
  Quote,
} from "lucide-react";

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="rounded-lg p-2 text-muted transition-colors hover:bg-bg hover:text-navy"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const MAX_DIMENSION = 1920;
const SKIP_COMPRESSION_UNDER = 800 * 1024; // 800KB
const COMPRESSIBLE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < SKIP_COMPRESSION_UNDER) return file;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, 0.85)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name, { type: file.type });
  } catch {
    return file;
  }
}

export function MarkdownEditor({
  value,
  onChange,
  rows = 20,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef(value);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    contentRef.current = value;
  }, [value]);

  function commit(next: string) {
    contentRef.current = next;
    onChange(next);
  }

  function insertAtCursor(text: string): { start: number; end: number } {
    const el = textareaRef.current;
    const cur = contentRef.current;
    if (!el) {
      commit(cur + text);
      return { start: cur.length, end: cur.length + text.length };
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    commit(cur.slice(0, start) + text + cur.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
    return { start, end: start + text.length };
  }

  function replaceRange(start: number, end: number, text: string) {
    const cur = contentRef.current;
    commit(cur.slice(0, start) + text + cur.slice(end));
  }

  function wrapSelection(before: string, after: string, placeholder: string) {
    const el = textareaRef.current;
    const cur = contentRef.current;
    if (!el) {
      insertAtCursor(`${before}${placeholder}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = cur.slice(start, end) || placeholder;
    commit(cur.slice(0, start) + before + selected + after + cur.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function prefixLines(prefix: string) {
    const el = textareaRef.current;
    const cur = contentRef.current;
    if (!el) {
      insertAtCursor(prefix);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = cur.lastIndexOf("\n", start - 1) + 1;
    const target = cur.slice(lineStart, end);
    const replaced = target.replace(/^/gm, prefix);
    commit(cur.slice(0, lineStart) + replaced + cur.slice(end));
    const delta = replaced.length - target.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(end + delta, end + delta);
    });
  }

  async function uploadImage(original: File) {
    const placeholder = `\`업로드 중: ${original.name}\``;
    insertAtCursor(placeholder + "\n");

    setUploading((n) => n + 1);
    setError(null);
    try {
      const file = await compressImage(original);
      const body = new FormData();
      body.append("file", file, file.name);

      const res = await fetch("/api/posts/images", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "이미지 업로드에 실패했습니다.");

      const alt = original.name.replace(/\.[^.]+$/, "");
      const cur = contentRef.current;
      const idx = cur.indexOf(placeholder);
      if (idx === -1) {
        commit(cur + `![${alt}](${data.url})\n`);
      } else {
        replaceRange(idx, idx + placeholder.length, `![${alt}](${data.url})`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.";
      setError(message);
      const cur = contentRef.current;
      const idx = cur.indexOf(placeholder);
      if (idx !== -1) replaceRange(idx, idx + placeholder.length + 1, "");
    } finally {
      setUploading((n) => n - 1);
    }
  }

  function handleFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const image of images) {
      void uploadImage(image);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-surface px-2 py-1.5">
        <ToolbarButton icon={Bold} label="굵게" onClick={() => wrapSelection("**", "**", "굵게")} />
        <ToolbarButton
          icon={Italic}
          label="기울임"
          onClick={() => wrapSelection("*", "*", "기울임")}
        />
        <ToolbarButton icon={Heading2} label="제목" onClick={() => prefixLines("## ")} />
        <ToolbarButton icon={Quote} label="인용" onClick={() => prefixLines("> ")} />
        <ToolbarButton icon={List} label="목록" onClick={() => prefixLines("- ")} />
        <ToolbarButton icon={Code} label="코드" onClick={() => wrapSelection("`", "`", "code")} />
        <ToolbarButton
          icon={Link2}
          label="링크"
          onClick={() => wrapSelection("[", "](https://)", "링크 텍스트")}
        />
        <div className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          title="이미지 추가"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-muted transition-colors hover:bg-bg hover:text-navy"
        >
          {uploading > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">이미지</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <textarea
        ref={textareaRef}
        required
        rows={rows}
        value={value}
        onChange={(e) => commit(e.target.value)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.items)
            .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
            .map((item) => item.getAsFile())
            .filter((f): f is File => f !== null);
          if (files.length) {
            e.preventDefault();
            handleFiles(files);
          }
        }}
        placeholder="마크다운으로 작성하세요. 이미지는 붙여넣거나 드래그해서 바로 넣을 수 있어요."
        className={`w-full rounded-b-xl border px-4 py-3 text-sm font-mono outline-none transition-colors ${
          dragging ? "border-mint bg-mint/5" : "border-border bg-bg focus:border-mint"
        }`}
      />

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
