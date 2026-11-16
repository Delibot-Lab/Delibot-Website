"use client";

import { FileText, Download } from "lucide-react";
import type { MessageAttachment } from "@/lib/chat";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

export function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  const signedUrl = attachment.url;
  const isImage = attachment.content_type && IMAGE_TYPES.has(attachment.content_type);

  if (isImage) {
    return (
      <a href={signedUrl} target="_blank" rel="noreferrer" className="mt-1 block w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element -- 서명 URL이 매번 바뀌는 임시 링크라 next/image 최적화 대상이 아님 */}
        <img
          src={signedUrl}
          alt={attachment.filename}
          className="max-h-64 rounded-lg border border-border object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-1 flex w-fit items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-navy hover:bg-bg"
    >
      <FileText className="h-4 w-4 shrink-0" aria-hidden />
      {attachment.filename}
      <Download className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
    </a>
  );
}
