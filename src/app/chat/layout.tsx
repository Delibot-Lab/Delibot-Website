import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { apiFetch, getCurrentUser } from "@/lib/api-server";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatSidebarProvider } from "@/components/chat/ChatSidebarContext";
import type { Channel } from "@/lib/chat";

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

  const response = await apiFetch("/api/v1/chat/channels");
  const visibleChannels = response.ok ? await response.json() as Channel[] : [];

  return (
    <section className="bg-bg">
      <ChatSidebarProvider>
        <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-7xl">
          <ChatSidebar channels={visibleChannels} />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </ChatSidebarProvider>
    </section>
  );
}
