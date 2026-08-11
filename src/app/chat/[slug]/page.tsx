import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { ChatView } from "@/components/chat/ChatView";
import type { Channel, ChatMessage } from "@/lib/supabase/chat";

export default async function ChatChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const supabase = await createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("id, slug, name, description, kind, team")
    .eq("slug", slug)
    .maybeSingle();

  if (!channel) notFound();

  if (channel.kind === "team" && !user.isAdmin) {
    const { data: application } = await supabase
      .from("applications")
      .select("teams")
      .eq("user_id", user.id)
      .maybeSingle();
    const teams = (application?.teams ?? []) as string[];
    if (!teams.includes(channel.team as string)) notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, channel_id, user_id, parent_id, content, created_at, edited_at")
    .eq("channel_id", channel.id)
    .is("parent_id", null)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <ChatView
      key={channel.id}
      channel={channel as Channel}
      initialMessages={(messages ?? []) as ChatMessage[]}
      currentUserId={user.id}
    />
  );
}
