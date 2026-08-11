import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatSidebarProvider } from "@/components/chat/ChatSidebarContext";
import type { Channel } from "@/lib/supabase/chat";

export const metadata: Metadata = {
  title: "채팅",
  robots: { index: false, follow: false },
};

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <section className="bg-bg py-24">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold text-navy">로그인이 필요합니다</h1>
          <Link href="/login" className="text-mint-strong hover:underline">
            로그인하러 가기
          </Link>
        </Container>
      </section>
    );
  }

  const supabase = await createClient();

  let userTeams: string[] = [];

  if (!user.isAdmin) {
    const { data: application } = await supabase
      .from("applications")
      .select("teams")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!application) {
      return (
        <section className="bg-bg py-24">
          <Container className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold text-navy">아직 동아리원이 아니에요</h1>
            <p className="text-sm text-muted">
              메신저는 동아리 지원서를 제출한 회원만 이용할 수 있어요.
            </p>
            <Link
              href="/join"
              className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              지원서 작성하러 가기
            </Link>
          </Container>
        </section>
      );
    }

    userTeams = (application.teams ?? []) as string[];
  }

  const { data: channels } = await supabase
    .from("channels")
    .select("id, slug, name, description, kind, team")
    .order("kind")
    .order("name");

  // admin은 팀 채널 4개를 전부 보고, 일반 회원은 본인이 지원한 팀 채널만 본다.
  const visibleChannels = (channels ?? []).filter(
    (c) => c.kind === "topic" || user.isAdmin || userTeams.includes(c.team as string)
  ) as Channel[];

  const channelIds = visibleChannels.map((c) => c.id);
  const [{ data: reads }, { data: recentMessages }] = await Promise.all([
    supabase.from("channel_reads").select("channel_id, last_read_at").eq("user_id", user.id),
    channelIds.length
      ? supabase
          .from("messages")
          .select("channel_id, created_at")
          .in("channel_id", channelIds)
          .is("parent_id", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { channel_id: string; created_at: string }[] }),
  ]);

  const lastReadMap = new Map((reads ?? []).map((r) => [r.channel_id, r.last_read_at]));
  const lastMessageMap = new Map<string, string>();
  for (const m of recentMessages ?? []) {
    if (!lastMessageMap.has(m.channel_id)) lastMessageMap.set(m.channel_id, m.created_at);
  }
  const unreadChannelIds = channelIds.filter((id) => {
    const lastMessage = lastMessageMap.get(id);
    if (!lastMessage) return false;
    const lastRead = lastReadMap.get(id);
    return !lastRead || new Date(lastMessage) > new Date(lastRead);
  });

  return (
    <section className="bg-bg">
      <ChatSidebarProvider>
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl">
          <ChatSidebar channels={visibleChannels} initialUnreadChannelIds={unreadChannelIds} />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </ChatSidebarProvider>
    </section>
  );
}
