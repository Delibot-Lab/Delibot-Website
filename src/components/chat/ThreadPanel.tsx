"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatMessageTime,
  type ChannelMember,
  type ChatMessage,
  type MessageAttachment,
} from "@/lib/supabase/chat";
import { MessageContent } from "./MessageContent";
import { MessageComposer } from "./MessageComposer";
import { AttachmentPreview } from "./AttachmentPreview";

export function ThreadPanel({
  channelId,
  parentId,
  memberNames,
  members,
  currentUserId,
  onClose,
}: {
  channelId: string;
  parentId: string;
  memberNames: Record<string, string>;
  members: ChannelMember[];
  currentUserId: string;
  onClose: () => void;
}) {
  const [parent, setParent] = useState<ChatMessage | null>(null);
  const [replies, setReplies] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<Record<string, MessageAttachment[]>>({});
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: parentData } = await supabase
        .from("messages")
        .select("id, channel_id, user_id, parent_id, content, created_at, edited_at")
        .eq("id", parentId)
        .single();
      if (!cancelled) setParent(parentData as ChatMessage);

      const { data: replyData } = await supabase
        .from("messages")
        .select("id, channel_id, user_id, parent_id, content, created_at, edited_at")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const replies = (replyData ?? []) as ChatMessage[];
      setReplies(replies);

      const messageIds = [parentId, ...replies.map((r) => r.id)];
      const { data: attachmentData } = await supabase
        .from("message_attachments")
        .select("id, message_id, url, filename, content_type, size")
        .in("message_id", messageIds);
      if (cancelled || !attachmentData) return;
      const grouped: Record<string, MessageAttachment[]> = {};
      for (const att of attachmentData as MessageAttachment[]) {
        (grouped[att.message_id] ??= []).push(att);
      }
      setAttachments(grouped);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, parentId]);

  useEffect(() => {
    const sub = supabase
      .channel(`thread:${parentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `parent_id=eq.${parentId}` },
        (payload) => {
          const message = payload.new as ChatMessage;
          setReplies((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [supabase, parentId]);

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-bg">
      <header className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-bold text-navy">스레드</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-navy"
          aria-label="스레드 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {parent && (
          <div className="border-b border-border pb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-navy">
                {memberNames[parent.user_id] ?? "알 수 없음"}
              </span>
              <span className="text-xs text-muted">{formatMessageTime(parent.created_at)}</span>
            </div>
            <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
              <MessageContent content={parent.content} memberNames={memberNames} />
            </div>
            {attachments[parent.id]?.map((att) => (
              <AttachmentPreview key={att.id} attachment={att} />
            ))}
          </div>
        )}

        <p className="mb-2 mt-3 text-xs font-medium text-muted">
          {replies.length > 0 ? `답글 ${replies.length}개` : "아직 답글이 없어요"}
        </p>

        <ul className="flex flex-col gap-3">
          {replies.map((reply) => (
            <li key={reply.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-navy">
                  {memberNames[reply.user_id] ?? "알 수 없음"}
                  {reply.user_id === currentUserId && (
                    <span className="ml-1 text-xs font-normal text-muted">(나)</span>
                  )}
                </span>
                <span className="text-xs text-muted">{formatMessageTime(reply.created_at)}</span>
              </div>
              <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
                <MessageContent content={reply.content} memberNames={memberNames} />
              </div>
              {attachments[reply.id]?.map((att) => (
                <AttachmentPreview key={att.id} attachment={att} />
              ))}
            </li>
          ))}
        </ul>
      </div>

      <MessageComposer
        channelId={channelId}
        parentId={parentId}
        members={members}
        placeholder="답글 남기기"
      />
    </aside>
  );
}
