"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import type { Channel, ChannelMember, ChatMessage } from "@/lib/chat";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { useChatSidebar } from "./ChatSidebarContext";

export function ChatView({ channel, initialMessages, currentUserId, isAdmin }: {
  channel: Channel; initialMessages: ChatMessage[]; currentUserId: string; isAdmin: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const { open: openSidebar } = useChatSidebar();

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/v1/chat/channels/${channel.slug}/messages?limit=100`, { cache: "no-store" });
    if (response.ok) setMessages(((await response.json()) as ChatMessage[]).reverse());
  }, [channel.slug]);

  useEffect(() => {
    fetch("/api/v1/chat/members", { cache: "no-store" }).then(async (response) => {
      if (response.ok) setMembers(await response.json());
    });
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(timer);
  }, [channel.slug, refresh]);

  const memberNames = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member.name])), [members]);
  const memberAvatars = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member.avatar_url])), [members]);

  async function editMessage(messageId: string, content: string) {
    const response = await fetch(`/api/v1/chat/messages/${messageId}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }),
    });
    if (response.ok) {
      const updated = await response.json() as ChatMessage;
      setMessages((items) => items.map((item) => item.id === messageId ? updated : item));
    }
  }

  async function deleteMessage(messageId: string) {
    const response = await fetch(`/api/v1/chat/messages/${messageId}`, { method: "DELETE" });
    if (response.ok) setMessages((items) => items.filter((item) => item.id !== messageId));
  }

  return <div className="flex min-h-0 flex-1">
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3.5 md:px-5">
        <button type="button" onClick={openSidebar} aria-label="채널 목록 열기" className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-navy md:hidden"><Menu className="h-4 w-4" /></button>
        <h1 className="truncate font-bold text-navy">{channel.name}</h1>
        {channel.description && <span className="hidden truncate text-sm text-muted sm:inline">— {channel.description}</span>}
      </header>
      <MessageList messages={messages} memberNames={memberNames} memberAvatars={memberAvatars} currentUserId={currentUserId} isAdmin={isAdmin} replyCounts={{}} attachments={{}} onOpenThread={() => {}} onEditMessage={editMessage} onDeleteMessage={deleteMessage} />
      <MessageComposer channelSlug={channel.slug} placeholder={`${channel.name}에 메시지 보내기`} onSent={refresh} />
    </div>
  </div>;
}
