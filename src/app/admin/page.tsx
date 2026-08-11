import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/lib/site";
import { getCurrentUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `관리자 | ${siteConfig.name}`,
};

type Member = {
  id: string;
  email: string;
  name: string;
  birthday: string;
  created_at: string;
  applied: boolean;
  applied_at: string | null;
  teams: string[] | null;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_members");
  const members = (data ?? []) as Member[];

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

        <Card tone="surface">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy">회원 목록</h2>
            <span className="text-sm text-muted">총 {members.length}명</span>
          </div>

          {error ? (
            <p className="text-sm text-danger">회원 목록을 불러오지 못했습니다: {error.message}</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted">아직 가입한 회원이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-2 pr-4 font-medium">이름</th>
                    <th className="py-2 pr-4 font-medium">이메일</th>
                    <th className="py-2 pr-4 font-medium">생년월일</th>
                    <th className="py-2 pr-4 font-medium">가입일</th>
                    <th className="py-2 pr-4 font-medium">지원 상태</th>
                    <th className="py-2 pr-4 font-medium">지원 분야</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-border/60">
                      <td className="py-2.5 pr-4 font-medium text-navy">{m.name}</td>
                      <td className="py-2.5 pr-4 text-ink">{m.email}</td>
                      <td className="py-2.5 pr-4 text-ink">{formatDate(m.birthday)}</td>
                      <td className="py-2.5 pr-4 text-ink">{formatDate(m.created_at)}</td>
                      <td className="py-2.5 pr-4">
                        {m.applied ? (
                          <Badge color="mint">지원 완료</Badge>
                        ) : (
                          <Badge color="peach">미지원</Badge>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-ink">
                        {m.teams?.length ? m.teams.join(", ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Container>
    </section>
  );
}
