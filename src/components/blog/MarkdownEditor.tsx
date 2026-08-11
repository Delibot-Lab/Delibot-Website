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
  ListOrdered,
  Loader2,
  Quote,
  SeparatorHorizontal,
  SquareCode,
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

type SlashCommandBase = {
  key: string;
  label: string;
  hint: string;
  keywords: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SlashCommand =
  | (SlashCommandBase & { kind: "prefix"; prefix: string })
  | (SlashCommandBase & { kind: "wrap"; before: string; after: string; placeholder: string })
  | (SlashCommandBase & { kind: "image" });

const SLASH_COMMANDS: SlashCommand[] = [
  {
    key: "heading",
    label: "제목",
    hint: "## 큰 제목",
    keywords: "heading title h2 제목",
    icon: Heading2,
    kind: "prefix",
    prefix: "## ",
  },
  {
    key: "quote",
    label: "인용",
    hint: "> 인용문",
    keywords: "quote blockquote 인용",
    icon: Quote,
    kind: "prefix",
    prefix: "> ",
  },
  {
    key: "bullet",
    label: "글머리 기호 목록",
    hint: "- 항목",
    keywords: "list bullet ul 목록",
    icon: List,
    kind: "prefix",
    prefix: "- ",
  },
  {
    key: "numbered",
    label: "번호 매기기 목록",
    hint: "1. 항목",
    keywords: "list ordered number 번호 목록",
    icon: ListOrdered,
    kind: "prefix",
    prefix: "1. ",
  },
  {
    key: "divider",
    label: "구분선",
    hint: "---",
    keywords: "divider hr separator 구분선",
    icon: SeparatorHorizontal,
    kind: "prefix",
    prefix: "---\n",
  },
  {
    key: "code-block",
    label: "코드 블록",
    hint: "```",
    keywords: "code block 코드",
    icon: SquareCode,
    kind: "wrap",
    before: "```\n",
    after: "\n```",
    placeholder: "코드",
  },
  {
    key: "link",
    label: "링크",
    hint: "[텍스트](url)",
    keywords: "link url 링크",
    icon: Link2,
    kind: "wrap",
    before: "[",
    after: "](https://)",
    placeholder: "링크 텍스트",
  },
  {
    key: "image",
    label: "이미지",
    hint: "파일 업로드",
    keywords: "image picture upload 이미지 사진",
    icon: ImagePlus,
    kind: "image",
  },
];

const MIRROR_STYLE_PROPS = [
  "boxSizing",
  "width",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "tabSize",
  "wordSpacing",
] as const;

/** textarea 안에서 특정 인덱스(커서 위치)의 픽셀 좌표를 구한다 (슬래시 메뉴 위치 계산용). */
function getCaretCoordinates(el: HTMLTextAreaElement, index: number) {
  const div = document.createElement("div");
  const style = window.getComputedStyle(el);
  const divStyle = div.style as unknown as Record<string, string>;
  for (const prop of MIRROR_STYLE_PROPS) {
    divStyle[prop] = style[prop];
  }
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.top = "0";
  div.style.left = "-9999px";
  div.style.width = `${el.clientWidth}px`;

  div.textContent = el.value.slice(0, index);
  const marker = document.createElement("span");
  marker.textContent = "​";
  div.appendChild(marker);

  document.body.appendChild(div);
  const top = marker.offsetTop;
  const left = marker.offsetLeft;
  document.body.removeChild(div);

  return { top, left };
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
  const [slashMenu, setSlashMenu] = useState<{ start: number; query: string } | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    contentRef.current = value;
  }, [value]);

  const filteredCommands = slashMenu
    ? SLASH_COMMANDS.filter(
        (cmd) =>
          slashMenu.query === "" ||
          (cmd.label + cmd.keywords).toLowerCase().includes(slashMenu.query.toLowerCase())
      )
    : [];
  const activeIndex = Math.min(slashIndex, Math.max(filteredCommands.length - 1, 0));

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

  function replaceRangeAndSelect(
    start: number,
    end: number,
    text: string,
    selStart: number,
    selEnd: number
  ) {
    const cur = contentRef.current;
    commit(cur.slice(0, start) + text + cur.slice(end));
    const el = textareaRef.current;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + selStart, start + selEnd);
    });
  }

  function closeSlashMenu() {
    setSlashMenu(null);
    setSlashIndex(0);
  }

  function updateSlashMenu(el: HTMLTextAreaElement) {
    const pos = el.selectionStart;
    const val = el.value;
    const lineStart = val.lastIndexOf("\n", pos - 1) + 1;
    const lineToCursor = val.slice(lineStart, pos);
    const match = /^\/(\S*)$/.exec(lineToCursor);

    if (!match) {
      if (slashMenu) closeSlashMenu();
      return;
    }

    setSlashMenu({ start: lineStart, query: match[1] });
    setSlashIndex(0);

    const caret = getCaretCoordinates(el, pos);
    const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight) || 20;
    setMenuPos({
      top: el.offsetTop + caret.top - el.scrollTop + lineHeight,
      left: Math.min(
        el.offsetLeft + caret.left - el.scrollLeft,
        el.offsetLeft + el.clientWidth - 224
      ),
    });
  }

  function runSlashCommand(cmd: SlashCommand) {
    if (!slashMenu) return;
    const start = slashMenu.start;
    const end = start + 1 + slashMenu.query.length;
    closeSlashMenu();

    if (cmd.kind === "prefix") {
      replaceRangeAndSelect(start, end, cmd.prefix, cmd.prefix.length, cmd.prefix.length);
    } else if (cmd.kind === "wrap") {
      const text = `${cmd.before}${cmd.placeholder}${cmd.after}`;
      replaceRangeAndSelect(
        start,
        end,
        text,
        cmd.before.length,
        cmd.before.length + cmd.placeholder.length
      );
    } else {
      replaceRangeAndSelect(start, end, "", 0, 0);
      fileInputRef.current?.click();
    }
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
    <div className="relative">
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
        onChange={(e) => {
          commit(e.target.value);
          updateSlashMenu(e.target);
        }}
        onKeyDown={(e) => {
          if (!slashMenu) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSlashIndex((i) => (filteredCommands.length ? (i + 1) % filteredCommands.length : 0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSlashIndex((i) =>
              filteredCommands.length
                ? (i - 1 + filteredCommands.length) % filteredCommands.length
                : 0
            );
          } else if (e.key === "Enter" || e.key === "Tab") {
            if (!filteredCommands.length) return;
            e.preventDefault();
            runSlashCommand(filteredCommands[activeIndex]);
          } else if (e.key === "Escape") {
            e.preventDefault();
            closeSlashMenu();
          }
        }}
        onBlur={closeSlashMenu}
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
        placeholder="마크다운으로 작성하세요. '/'를 입력하면 서식 메뉴가 열려요. 이미지는 붙여넣거나 드래그해서 바로 넣을 수 있어요."
        className={`w-full rounded-b-xl border px-4 py-3 text-sm font-mono outline-none transition-colors ${
          dragging ? "border-mint bg-mint/5" : "border-border bg-bg focus:border-mint"
        }`}
      />

      {slashMenu && menuPos && (
        <div
          className="absolute z-20 w-56 overflow-hidden rounded-xl border border-border bg-bg py-1 shadow-lg"
          style={{ top: menuPos.top, left: Math.max(menuPos.left, 0) }}
        >
          {filteredCommands.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted">일치하는 명령이 없어요</p>
          ) : (
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runSlashCommand(cmd)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                  i === activeIndex ? "bg-surface" : "hover:bg-surface"
                }`}
              >
                <cmd.icon className="h-4 w-4 shrink-0 text-mint-strong" />
                <span>
                  <span className="block font-medium text-navy">{cmd.label}</span>
                  <span className="block text-xs text-muted">{cmd.hint}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
