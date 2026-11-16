import { notFound } from "next/navigation";
import { apiFetch, getCurrentUser } from "@/lib/api-server";
import { ChatView } from "@/components/chat/ChatView";
import type { Channel, ChatMessage } from "@/lib/chat";

export default async function ChatChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const channelsResponse = await apiFetch("/api/v1/chat/channels");
  if (!channelsResponse.ok) notFound();
  const channel = (await channelsResponse.json() as Channel[]).find((item) => item.slug === slug);
  if (!channel) notFound();
  const messagesResponse = await apiFetch(`/api/v1/chat/channels/${encodeURIComponent(slug)}/messages?limit=100`);
  const messages = messagesResponse.ok ? (await messagesResponse.json() as ChatMessage[]).reverse() : [];

  return (
    <ChatView
      key={channel.id}
      channel={channel}
      initialMessages={messages}
      currentUserId={user.id}
      isAdmin={user.isAdmin}
    />
  );
}
