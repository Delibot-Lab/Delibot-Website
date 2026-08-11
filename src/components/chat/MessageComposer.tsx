"use client";

import { useRef, useState } from "react";
import { Paperclip, SendHorizontal, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ChannelMember } from "@/lib/supabase/chat";

function extractMentionedUserIds(content: string, members: ChannelMember[]): string[] {
  const ids = new Set<string>();
  for (const member of members) {
    if (content.includes(`@${member.name}`)) ids.add(member.id);
  }
  return [...ids];
}

export function MessageComposer({
  channelId,
  parentId,
  members,
  placeholder,
  onSent,
}: {
  channelId: string;
  parentId?: string;
  members: ChannelMember[];
  placeholder: string;
  onSent?: () => void;
}) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<{ start: number; query: string } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMembers = mentionQuery
    ? members.filter((m) => m.name.toLowerCase().includes(mentionQuery.query.toLowerCase()))
    : [];

  function updateMentionQuery(el: HTMLTextAreaElement) {
    const pos = el.selectionStart;
    const before = el.value.slice(0, pos);
    const match = /(?:^|\s)@(\S*)$/.exec(before);
    if (match) {
      const start = pos - match[1].length - 1;
      setMentionQuery({ start, query: match[1] });
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  function insertMention(member: ChannelMember) {
    if (!mentionQuery) return;
    const el = textareaRef.current;
    const end = mentionQuery.start + 1 + mentionQuery.query.length;
    const next = content.slice(0, mentionQuery.start) + `@${member.name} ` + content.slice(end);
    setContent(next);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = mentionQuery.start + member.name.length + 2;
      el?.setSelectionRange(pos, pos);
    });
  }

  async function handleSend() {
    if (!content.trim() && !file) return;
    setSending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: claims } = await supabase.auth.getClaims();
      const userId = claims?.claims.sub;
      if (!userId) throw new Error("로그인이 필요합니다.");

      const { data: inserted, error: insertError } = await supabase
        .from("messages")
        .insert({
          channel_id: channelId,
          user_id: userId,
          parent_id: parentId ?? null,
          content: content.trim() || "(첨부파일)",
        })
        .select("id")
        .single();

      if (insertError || !inserted) throw insertError ?? new Error("전송에 실패했습니다.");

      const mentionedIds = extractMentionedUserIds(content, members);
      if (mentionedIds.length) {
        await supabase
          .from("message_mentions")
          .insert(mentionedIds.map((id) => ({ message_id: inserted.id, mentioned_user_id: id })));
      }

      if (file) {
        const path = `${channelId}/${inserted.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(path, file);
        if (!uploadError) {
          await supabase.from("message_attachments").insert({
            message_id: inserted.id,
            url: path,
            filename: file.name,
            content_type: file.type,
            size: file.size,
          });
        }
      }

      setContent("");
      setFile(null);
      onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative border-t border-border px-4 pt-3 pb-[calc(var(--spacing)*3+env(safe-area-inset-bottom))]">
      {mentionQuery && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-4 z-10 mb-1 w-56 overflow-hidden rounded-xl border border-border bg-bg py-1 shadow-lg">
          {filteredMembers.map((member, i) => (
            <button
              key={member.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertMention(member)}
              className={`block w-full px-3 py-1.5 text-left text-sm ${
                i === mentionIndex ? "bg-surface text-navy" : "text-ink hover:bg-surface"
              }`}
            >
              @{member.name}
            </button>
          ))}
        </div>
      )}

      {file && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs text-navy">
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
          {file.name}
          <button type="button" onClick={() => setFile(null)} aria-label="첨부파일 제거">
            <X className="h-3.5 w-3.5 text-muted hover:text-danger" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-navy"
          title="파일 첨부"
          aria-label="파일 첨부"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          placeholder={placeholder}
          onChange={(e) => {
            setContent(e.target.value);
            updateMentionQuery(e.target);
          }}
          onKeyDown={(e) => {
            if (mentionQuery && filteredMembers.length > 0) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setMentionIndex((i) => (i + 1) % filteredMembers.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setMentionIndex((i) => (i - 1 + filteredMembers.length) % filteredMembers.length);
                return;
              }
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                insertMention(filteredMembers[mentionIndex]);
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setMentionQuery(null);
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          className="max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-mint"
        />

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || (!content.trim() && !file)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-transform hover:scale-105 disabled:opacity-40"
          title="보내기"
          aria-label="보내기"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
