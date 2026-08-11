"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { formatMessageTime, type ChatMessage, type MessageAttachment } from "@/lib/supabase/chat";
import { MessageContent } from "./MessageContent";
import { AttachmentPreview } from "./AttachmentPreview";
import { Avatar } from "./Avatar";

export function MessageList({
  messages,
  memberNames,
  memberAvatars,
  currentUserId,
  replyCounts,
  attachments,
  onOpenThread,
}: {
  messages: ChatMessage[];
  memberNames: Record<string, string>;
  memberAvatars: Record<string, string | null>;
  currentUserId: string;
  replyCounts: Record<string, number>;
  attachments: Record<string, MessageAttachment[]>;
  onOpenThread: (messageId: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">아직 메시지가 없어요. 첫 메시지를 보내보세요!</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((message) => {
            const name = memberNames[message.user_id] ?? "알 수 없음";
            const isMe = message.user_id === currentUserId;
            const replyCount = replyCounts[message.id] ?? 0;
            return (
              <li key={message.id} className="flex gap-3">
                <Avatar userId={message.user_id} name={name} avatarUrl={memberAvatars[message.user_id]} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-navy">
                      {name}
                      {isMe && <span className="ml-1 text-xs font-normal text-muted">(나)</span>}
                    </span>
                    <span className="text-xs text-muted">{formatMessageTime(message.created_at)}</span>
                  </div>
                  <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
                    <MessageContent content={message.content} memberNames={memberNames} />
                  </div>
                  {attachments[message.id]?.map((att) => (
                    <AttachmentPreview key={att.id} attachment={att} />
                  ))}
                  <button
                    type="button"
                    onClick={() => onOpenThread(message.id)}
                    className="mt-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-mint-strong"
                  >
                    <MessageSquare className="h-3 w-3" aria-hidden />
                    {replyCount > 0 ? `답글 ${replyCount}개` : "답글"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
