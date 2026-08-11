"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, Users, X } from "lucide-react";
import type { Channel, ChatMessage } from "@/lib/supabase/chat";
import { createClient } from "@/lib/supabase/client";
import { useChatSidebar } from "./ChatSidebarContext";

export function ChatSidebar({
  channels,
  initialUnreadChannelIds,
}: {
  channels: Channel[];
  initialUnreadChannelIds: string[];
}) {
  const pathname = usePathname();
  const { isOpen, close } = useChatSidebar();
  const topicChannels = channels.filter((c) => c.kind === "topic");
  const teamChannels = channels.filter((c) => c.kind === "team");
  const supabase = useMemo(() => createClient(), []);

  const [unreadIds, setUnreadIds] = useState(() => new Set(initialUnreadChannelIds));
  const activeChannel = channels.find((c) => pathname === `/chat/${c.slug}`);

  // 지금 보고 있는 채널의 안 읽음 표시를 렌더링 중에 지운다(리액트가 권장하는
  // "prop이 바뀌면 상태를 조정하는" 패턴 — 이펙트에서 setState 하면 렌더가 한 번 더
  // 발생해서 리액트 컴파일러가 경고한다).
  const [syncedChannelId, setSyncedChannelId] = useState(activeChannel?.id);
  if (activeChannel && activeChannel.id !== syncedChannelId) {
    setSyncedChannelId(activeChannel.id);
    if (unreadIds.has(activeChannel.id)) {
      const next = new Set(unreadIds);
      next.delete(activeChannel.id);
      setUnreadIds(next);
    }
  }

  // 채널을 선택해 이동하면(모바일 드로어 상태에서) 자동으로 닫는다.
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 서버에도 last_read_at을 기록해서 다음 방문/다른 기기에서도 읽음 상태가 유지되게 한다.
  useEffect(() => {
    if (!activeChannel) return;
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      await supabase
        .from("channel_reads")
        .upsert(
          { user_id: user.id, channel_id: activeChannel.id, last_read_at: new Date().toISOString() },
          { onConflict: "user_id,channel_id" }
        );
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChannel, supabase]);

  // 새 메시지가 도착하면(지금 보고 있는 채널이 아닌 한) 안 읽음 표시를 켠다.
  useEffect(() => {
    const channelIds = new Set(channels.map((c) => c.id));
    const sub = supabase
      .channel("chat-sidebar-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const message = payload.new as ChatMessage;
          if (message.parent_id) return;
          if (!channelIds.has(message.channel_id)) return;
          if (activeChannel?.id === message.channel_id) return;
          setUnreadIds((prev) => new Set(prev).add(message.channel_id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [channels, supabase, activeChannel?.id]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[55] bg-navy/30 md:hidden"
          onClick={close}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-3 py-5 transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between md:hidden">
          <p className="px-2 text-sm font-bold text-navy">채널</p>
          <button
            type="button"
            onClick={close}
            aria-label="채널 목록 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ChannelGroup
          label="채널"
          icon={Hash}
          channels={topicChannels}
          pathname={pathname}
          unreadIds={unreadIds}
        />
        <ChannelGroup
          label="팀 채널"
          icon={Users}
          channels={teamChannels}
          pathname={pathname}
          unreadIds={unreadIds}
        />
      </aside>
    </>
  );
}

function ChannelGroup({
  label,
  icon: Icon,
  channels,
  pathname,
  unreadIds,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  channels: Channel[];
  pathname: string;
  unreadIds: Set<string>;
}) {
  if (channels.length === 0) return null;
  return (
    <div>
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <ul className="mt-1.5 flex flex-col gap-0.5">
        {channels.map((channel) => {
          const href = `/chat/${channel.slug}`;
          const active = pathname === href;
          const unread = unreadIds.has(channel.id);
          return (
            <li key={channel.id}>
              <Link
                href={href}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-bg font-medium text-navy shadow-sm"
                    : unread
                      ? "font-bold text-navy hover:bg-bg/60"
                      : "font-medium text-muted hover:bg-bg/60 hover:text-navy"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{channel.name}</span>
                {unread && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-mint-strong"
                    aria-label="읽지 않은 메시지 있음"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
