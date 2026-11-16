export type Channel = { id: string; slug: string; name: string; description: string | null; kind: "topic" | "team"; team: string | null };
export type ChatMessage = { id: string; channel_id: string; user_id: string; parent_id: string | null; content: string; created_at: string; edited_at: string | null };
export type MessageAttachment = { id: string; message_id: string; url: string; filename: string; content_type: string | null; size: number | null };
export type ChannelMember = { id: string; name: string; avatar_url: string | null };
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const hours24 = date.getHours();
  const period = hours24 < 12 ? "오전" : "오후";
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${period} ${hours12}:${minutes}`;
}
