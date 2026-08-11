import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/posts";
import { AdminDashboard, type AdminMember, type AdminPost } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const supabase = await createClient();
  const [{ data: membersData, error }, posts] = await Promise.all([
    supabase.rpc("admin_list_members"),
    getAllPosts().catch(() => [] as AdminPost[]),
  ]);
  const members = (membersData ?? []) as AdminMember[];

  return (
    <section className="bg-bg py-16 md:py-24">
      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-navy">관리자</h1>
          <div className="flex gap-2">
            <Link
              href="/blog/write"
              className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              새 글 작성
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-surface"
            >
              블로그로
            </Link>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-danger">회원 목록을 불러오지 못했습니다: {error.message}</p>
        ) : (
          <AdminDashboard members={members} posts={posts as AdminPost[]} currentUserId={user.id} />
        )}
      </Container>
    </section>
  );
}
