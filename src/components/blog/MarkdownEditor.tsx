"use client";

import { useMemo, useState } from "react";
import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

/**
 * BlockNote의 마크다운 파서는 이미지가 앞뒤 문단과 줄바꿈 하나로만 붙어 있으면
 * (빈 줄로 분리된 별도 블록이 아니면) 라운드트립 과정에서 이미지를 통째로 삭제한다.
 * 기존에 이런 식으로 쓰인 글을 불러올 때 이미지가 사라지지 않도록, 파싱 전에
 * 이미지 앞뒤에 빈 줄을 강제로 넣어 항상 독립된 블록이 되게 한다.
 */
function isolateImagesForBlockNote(markdown: string): string {
  return markdown
    .replace(/([^\n])\n(!\[[^\]]*\]\([^)]*\))/g, "$1\n\n$2")
    .replace(/(!\[[^\]]*\]\([^)]*\))\n(?!\n)/g, "$1\n\n");
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
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  // 마운트 시점의 값으로만 초기 블록을 만든다. 이후로는 에디터가 상태를 직접 소유하고
  // onChange를 통해 마크다운 문자열을 부모로 흘려보낸다 (uncontrolled 패턴).
  const initialContent = useMemo<PartialBlock[] | undefined>(() => {
    if (!value.trim()) return undefined;
    const parser = BlockNoteEditor.create();
    return parser.tryParseMarkdownToBlocks(isolateImagesForBlockNote(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editor = useCreateBlockNote({
    initialContent,
    uploadFile: async (file: File): Promise<string> => {
      setError(null);
      try {
        const compressed = await compressImage(file);
        const body = new FormData();
        body.append("file", compressed, compressed.name);

        const res = await fetch("/api/posts/images", { method: "POST", body });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "이미지 업로드에 실패했습니다.");

        return data.url as string;
      } catch (err) {
        const message = err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.";
        setError(message);
        throw err;
      }
    },
  });

  return (
    <div>
      <div className="max-h-[36rem] min-h-[20rem] overflow-y-auto rounded-xl border border-border bg-bg">
        <BlockNoteView
          editor={editor}
          theme="light"
          onChange={() => {
            onChange(editor.blocksToMarkdownLossy(editor.document));
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
