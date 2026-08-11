"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MessageAttachment } from "@/lib/supabase/chat";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

export function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .storage.from("chat-attachments")
      .createSignedUrl(attachment.url, 3600)
      .then(({ data }) => {
        if (!cancelled && data) setSignedUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [attachment.url]);

  const isImage = attachment.content_type && IMAGE_TYPES.has(attachment.content_type);

  if (!signedUrl) {
    return (
      <div className="mt-1 h-24 w-40 animate-pulse rounded-lg bg-surface" />
    );
  }

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
