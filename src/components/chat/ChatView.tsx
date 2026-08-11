"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Channel, ChannelMember, ChatMessage, MessageAttachment } from "@/lib/supabase/chat";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { ThreadPanel } from "./ThreadPanel";
import { useChatSidebar } from "./ChatSidebarContext";

export function ChatView({
  channel,
  initialMessages,
  currentUserId,
  isAdmin,
}: {
  channel: Channel;
  initialMessages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});
  const [attachments, setAttachments] = useState<Record<string, MessageAttachment[]>>({});
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [threadParentId, setThreadParentId] = useState<string | null>(null);
  const { open: openSidebar } = useChatSidebar();

  const supabase = useMemo(() => createClient(), []);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (initialMessages.length === 0) return;
    let cancelled = false;
    supabase
      .from("message_attachments")
      .select("id, message_id, url, filename, content_type, size")
      .in(
        "message_id",
        initialMessages.map((m) => m.id)
      )
      .then(({ data }) => {
        if (cancelled || !data) return;
        const grouped: Record<string, MessageAttachment[]> = {};
        for (const att of data as MessageAttachment[]) {
          (grouped[att.message_id] ??= []).push(att);
        }
        setAttachments(grouped);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, initialMessages]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc("list_channel_members", { p_channel_id: channel.id })
      .then(({ data }) => {
        if (!cancelled && data) setMembers(data as ChannelMember[]);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, channel.id]);

  useEffect(() => {
    const sub = supabase
      .channel(`messages:${channel.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channel.id}` },
        (payload) => {
          const message = payload.new as ChatMessage;
          if (message.parent_id) {
            setReplyCounts((prev) => ({
              ...prev,
              [message.parent_id!]: (prev[message.parent_id!] ?? 0) + 1,
            }));
            return;
          }
          setMessages((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `channel_id=eq.${channel.id}` },
        (payload) => {
          const old = payload.old as ChatMessage;
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `channel_id=eq.${channel.id}` },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    // message_attachments에는 channel_id가 없어서 postgres_changes 필터를 걸 수 없다.
    // 전체 INSERT를 구독하고, 지금 이 채널에 있는 메시지에 속하는 것만 반영한다.
    const attachmentSub = supabase
      .channel(`attachments:${channel.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_attachments" },
        (payload) => {
          const att = payload.new as MessageAttachment;
          if (!messagesRef.current.some((m) => m.id === att.message_id)) return;
          setAttachments((prev) => ({
            ...prev,
            [att.message_id]: [...(prev[att.message_id] ?? []), att],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
      supabase.removeChannel(attachmentSub);
    };
  }, [supabase, channel.id]);

  async function handleEditMessage(messageId: string, content: string) {
    const { data, error } = await supabase
      .from("messages")
      .update({ content, edited_at: new Date().toISOString() })
      .eq("id", messageId)
      .select("id, channel_id, user_id, parent_id, content, created_at, edited_at")
      .single();
    if (error) return;
    setMessages((prev) => prev.map((m) => (m.id === messageId ? (data as ChatMessage) : m)));
  }

  async function handleDeleteMessage(messageId: string) {
    const { error } = await supabase.from("messages").delete().eq("id", messageId);
    if (error) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) map[m.id] = m.name;
    return map;
  }, [members]);

  const memberAvatars = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const m of members) map[m.id] = m.avatar_url;
    return map;
  }, [members]);

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3.5 md:px-5">
          <button
            type="button"
            onClick={openSidebar}
            aria-label="채널 목록 열기"
            className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-navy md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="truncate font-bold text-navy">{channel.name}</h1>
          {channel.description && (
            <span className="hidden truncate text-sm text-muted sm:inline">
              — {channel.description}
            </span>
          )}
        </header>

        <MessageList
          messages={messages}
          memberNames={memberNames}
          memberAvatars={memberAvatars}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          replyCounts={replyCounts}
          attachments={attachments}
          onOpenThread={setThreadParentId}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
        />

        <MessageComposer
          channelId={channel.id}
          members={members}
          placeholder={`${channel.name}에 메시지 보내기`}
        />
      </div>

      {threadParentId && (
        <ThreadPanel
          channelId={channel.id}
          parentId={threadParentId}
          memberNames={memberNames}
          memberAvatars={memberAvatars}
          members={members}
          currentUserId={currentUserId}
          onClose={() => setThreadParentId(null)}
        />
      )}
    </div>
  );
}
