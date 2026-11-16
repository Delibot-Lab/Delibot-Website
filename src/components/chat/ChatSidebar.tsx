"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, Users, X, type LucideIcon } from "lucide-react";
import type { Channel } from "@/lib/chat";
import { useChatSidebar } from "./ChatSidebarContext";

export function ChatSidebar({ channels }: { channels: Channel[]; initialUnreadChannelIds?: string[] }) {
  const pathname = usePathname();
  const { isOpen, close } = useChatSidebar();
  return <>
    {isOpen && <div className="fixed inset-0 z-[55] bg-navy/30 md:hidden" onClick={close} aria-hidden />}
    <aside className={`fixed inset-y-0 left-0 z-[60] flex w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-3 py-5 transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between md:hidden"><p className="px-2 text-sm font-bold text-navy">채널</p><button type="button" onClick={close} aria-label="채널 목록 닫기" className="flex h-8 w-8 items-center justify-center rounded-full text-muted"><X className="h-4 w-4" /></button></div>
      <Group label="채널" icon={Hash} channels={channels.filter((item) => item.kind === "topic")} pathname={pathname} close={close} />
      <Group label="팀 채널" icon={Users} channels={channels.filter((item) => item.kind === "team")} pathname={pathname} close={close} />
    </aside>
  </>;
}

function Group({ label, icon: Icon, channels, pathname, close }: { label: string; icon: LucideIcon; channels: Channel[]; pathname: string; close: () => void }) {
  if (!channels.length) return null;
  return <div><p className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-muted"><Icon className="h-3.5 w-3.5" />{label}</p>
    <div className="space-y-1">{channels.map((channel) => {
      const active = pathname === `/chat/${channel.slug}`;
      return <Link key={channel.id} href={`/chat/${channel.slug}`} onClick={close} className={`block rounded-xl px-3 py-2 text-sm font-medium ${active ? "bg-mint/15 text-mint-strong" : "text-ink hover:bg-bg"}`}>{channel.name}</Link>;
    })}</div>
  </div>;
}
