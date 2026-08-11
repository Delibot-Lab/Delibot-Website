export type Channel = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: "topic" | "team";
  team: string | null;
};

export type ChatMessage = {
  id: string;
  channel_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  edited_at: string | null;
};

export type MessageAttachment = {
  id: string;
  message_id: string;
  url: string;
  filename: string;
  content_type: string | null;
  size: number | null;
};

export type ChannelMember = {
  id: string;
  name: string;
};

/**
 * toLocaleTimeString("ko-KR")은 서버(Node ICU 데이터)와 브라우저가 "PM"/"오후"처럼
 * 다르게 렌더링해서 하이드레이션 불일치를 일으킨다. 로케일에 기대지 않고 직접 포맷한다.
 */
export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const hours24 = d.getHours();
  const period = hours24 < 12 ? "오전" : "오후";
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${period} ${hours12}:${minutes}`;
}
