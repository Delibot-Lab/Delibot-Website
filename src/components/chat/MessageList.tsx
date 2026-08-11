"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
import { formatMessageTime, type ChatMessage, type MessageAttachment } from "@/lib/supabase/chat";
import { MessageContent } from "./MessageContent";
import { AttachmentPreview } from "./AttachmentPreview";
import { Avatar } from "./Avatar";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogProvider";

export function MessageList({
  messages,
  memberNames,
  memberAvatars,
  currentUserId,
  isAdmin,
  replyCounts,
  attachments,
  onOpenThread,
  onEditMessage,
  onDeleteMessage,
}: {
  messages: ChatMessage[];
  memberNames: Record<string, string>;
  memberAvatars: Record<string, string | null>;
  currentUserId: string;
  isAdmin: boolean;
  replyCounts: Record<string, number>;
  attachments: Record<string, MessageAttachment[]>;
  onOpenThread: (messageId: string) => void;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function startEdit(message: ChatMessage) {
    setEditingId(message.id);
    setDraft(message.content);
  }

  async function saveEdit(messageId: string) {
    const content = draft.trim();
    if (!content) return;
    await onEditMessage(messageId, content);
    setEditingId(null);
  }

  async function handleDelete(messageId: string) {
    const ok = await confirmDialog({
      title: "메시지를 삭제할까요?",
      description: "이 작업은 되돌릴 수 없어요.",
      confirmLabel: "삭제",
      danger: true,
    });
    if (!ok) return;
    await onDeleteMessage(messageId);
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {messages.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">아직 메시지가 없어요. 첫 메시지를 보내보세요!</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((message) => {
            const name = memberNames[message.user_id] ?? "알 수 없음";
            const isMe = message.user_id === currentUserId;
            const canEdit = isMe;
            const canDelete = isMe || isAdmin;
            const replyCount = replyCounts[message.id] ?? 0;
            const isEditing = editingId === message.id;
            return (
              <li key={message.id} className="group flex gap-3">
                <Avatar userId={message.user_id} name={name} avatarUrl={memberAvatars[message.user_id]} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-navy">
                      {name}
                      {isMe && <span className="ml-1 text-xs font-normal text-muted">(나)</span>}
                    </span>
                    <span className="text-xs text-muted">{formatMessageTime(message.created_at)}</span>
                    {message.edited_at && <span className="text-xs text-muted">(수정됨)</span>}
                    {(canEdit || canDelete) && !isEditing && (
                      // 터치 기기엔 hover가 없어서 항상 보이게 하고, 데스크톱(md+)에서만
                      // 마우스 오버 시 나타나는 절제된 UI로 바꾼다.
                      <span className="ml-auto flex items-center gap-0.5 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => startEdit(message)}
                            aria-label="메시지 수정"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-navy"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(message.id)}
                            aria-label="메시지 삭제"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-danger"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-1 flex flex-col gap-1.5">
                      <textarea
                        autoFocus
                        rows={2}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void saveEdit(message.id);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full resize-none rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm outline-none focus:border-mint"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void saveEdit(message.id)}
                          className="flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white"
                        >
                          <Check className="h-3 w-3" /> 저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-navy"
                        >
                          <X className="h-3 w-3" /> 취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
                      <MessageContent content={message.content} memberNames={memberNames} />
                    </div>
                  )}
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
