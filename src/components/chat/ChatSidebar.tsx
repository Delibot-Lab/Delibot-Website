"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, Users } from "lucide-react";
import type { Channel } from "@/lib/supabase/chat";

export function ChatSidebar({ channels }: { channels: Channel[] }) {
  const pathname = usePathname();
  const topicChannels = channels.filter((c) => c.kind === "topic");
  const teamChannels = channels.filter((c) => c.kind === "team");

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-3 py-5">
      <ChannelGroup label="채널" icon={Hash} channels={topicChannels} pathname={pathname} />
      <ChannelGroup label="팀 채널" icon={Users} channels={teamChannels} pathname={pathname} />
    </aside>
  );
}

function ChannelGroup({
  label,
  icon: Icon,
  channels,
  pathname,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  channels: Channel[];
  pathname: string;
}) {
  if (channels.length === 0) return null;
  return (
    <div>
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <ul className="mt-1.5 flex flex-col gap-0.5">
        {channels.map((channel) => {
          const href = `/chat/${channel.slug}`;
          const active = pathname === href;
          return (
            <li key={channel.id}>
              <Link
                href={href}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-bg text-navy shadow-sm" : "text-muted hover:bg-bg/60 hover:text-navy"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {channel.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
