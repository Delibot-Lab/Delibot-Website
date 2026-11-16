"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

export function MessageComposer({ channelSlug, parentId, placeholder, onSent }: {
  channelSlug: string; parentId?: string; placeholder: string; onSent?: () => void;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    const response = await fetch(`/api/v1/chat/channels/${channelSlug}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: content.trim(), parent_id: parentId ?? null }),
    });
    if (response.ok) {
      setContent("");
      onSent?.();
    } else {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "전송에 실패했습니다.");
    }
    setSending(false);
  }

  return <div className="border-t border-border px-4 pt-3 pb-[calc(var(--spacing)*3+env(safe-area-inset-bottom))]">
    <div className="flex items-end gap-2">
      <textarea rows={1} value={content} placeholder={placeholder} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); }
      }} className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm outline-none focus:border-mint" />
      <button type="button" onClick={() => void send()} disabled={sending || !content.trim()} aria-label="메시지 전송" className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white disabled:opacity-40"><SendHorizontal className="h-4 w-4" /></button>
    </div>
    {error && <p className="mt-2 text-xs text-danger">{error}</p>}
  </div>;
}
