"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Pencil,
  Trash2,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogProvider";

export type AdminMember = {
  id: string;
  email: string;
  name: string;
  birthday: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  applied: boolean;
  applied_at: string | null;
  teams: string[] | null;
  phone: string | null;
  github_id: string | null;
  motivation: string | null;
};

export type AdminPost = {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
};

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

function fmtDate(value: string | null): string {
  if (!value) return "-";
  // 서버에서 이미 ISO 문자열로 넘어오므로, 로케일 API에 기대지 않고 직접 자른다
  // (하이드레이션 불일치 방지 — MarkdownEditor 채팅 타임스탬프와 같은 이유).
  return value.slice(0, 10);
}

export function AdminDashboard({
  members: initialMembers,
  posts,
  currentUserId,
}: {
  members: AdminMember[];
  posts: AdminPost[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"members" | "posts">("members");
  const [members, setMembers] = useState(initialMembers);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const confirmDialog = useConfirmDialog();

  const stats = [
    { label: "총 회원", value: members.length, icon: Users },
    { label: "지원 완료", value: members.filter((m) => m.applied).length, icon: CheckCircle2 },
    { label: "블로그 글", value: posts.length, icon: FileText },
    { label: "관리자", value: members.filter((m) => m.is_admin).length, icon: ShieldCheck },
  ];

  async function toggleAdmin(member: AdminMember) {
    setError(null);
    setTogglingId(member.id);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("toggle_admin", {
        p_user_id: member.id,
        p_is_admin: !member.is_admin,
      });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_admin: !m.is_admin } : m))
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteMember(member: AdminMember) {
    const ok = await confirmDialog({
      title: `"${member.name}" 회원을 삭제할까요?`,
      description: "계정, 지원서, 채팅 기록이 모두 삭제됩니다. 이 작업은 되돌릴 수 없어요.",
      confirmLabel: "삭제",
      danger: true,
    });
    if (!ok) return;

    setError(null);
    setDeletingMemberId(member.id);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("admin_delete_member", {
        p_user_id: member.id,
      });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      if (expandedId === member.id) setExpandedId(null);
    } finally {
      setDeletingMemberId(null);
    }
  }

  async function deletePost(slug: string, title: string) {
    const ok = await confirmDialog({
      title: `"${title}" 글을 삭제할까요?`,
      description: "이 작업은 되돌릴 수 없어요.",
      confirmLabel: "삭제",
      danger: true,
    });
    if (!ok) return;

    setError(null);
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "삭제에 실패했습니다.");
        return;
      }
      router.refresh();
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="오류 메시지 닫기"
            className="shrink-0 font-semibold hover:underline"
          >
            닫기
          </button>
        </div>
      )}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-mint-strong">
              <s.icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex gap-1 rounded-full bg-surface p-1 text-sm font-semibold w-fit">
        <button
          type="button"
          onClick={() => setTab("members")}
          className={`rounded-full px-4 py-2 transition-colors ${
            tab === "members" ? "bg-bg text-navy shadow-sm" : "text-muted"
          }`}
        >
          회원 관리
        </button>
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`rounded-full px-4 py-2 transition-colors ${
            tab === "posts" ? "bg-bg text-navy shadow-sm" : "text-muted"
          }`}
        >
          블로그 관리
        </button>
      </div>

      {tab === "members" ? (
        members.length === 0 ? (
          <p className="text-sm text-muted">아직 가입한 회원이 없습니다.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-3 pl-4 pr-2 font-medium" />
                    <th className="py-3 pr-4 font-medium">이름</th>
                    <th className="py-3 pr-4 font-medium">이메일</th>
                    <th className="py-3 pr-4 font-medium">생년월일</th>
                    <th className="py-3 pr-4 font-medium">가입일</th>
                    <th className="py-3 pr-4 font-medium">지원 상태</th>
                    <th className="py-3 pr-4 font-medium">지원 분야</th>
                    <th className="py-3 pr-4 font-medium">권한</th>
                    <th className="py-3 pr-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const expanded = expandedId === m.id;
                    return (
                      <Fragment key={m.id}>
                        <tr
                          onClick={() => setExpandedId(expanded ? null : m.id)}
                          className="cursor-pointer border-b border-border/60 bg-bg transition-colors hover:bg-surface"
                        >
                          <td className="py-2.5 pl-4 pr-2">
                            <ChevronDown
                              className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              {m.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element -- 동적 업로드 이미지
                                <img
                                  src={m.avatar_url}
                                  alt={m.name}
                                  className="h-7 w-7 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-xs font-bold text-white">
                                  {initials(m.name)}
                                </div>
                              )}
                              <span className="font-medium text-navy">{m.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-ink">{m.email}</td>
                          <td className="py-2.5 pr-4 text-ink">{fmtDate(m.birthday)}</td>
                          <td className="py-2.5 pr-4 text-ink">{fmtDate(m.created_at)}</td>
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
                          <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleAdmin(m)}
                              disabled={togglingId === m.id || m.id === currentUserId}
                              title={m.id === currentUserId ? "본인 권한은 스스로 해제할 수 없어요" : undefined}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                m.is_admin
                                  ? "bg-navy text-white hover:bg-navy/85"
                                  : "border border-border text-muted hover:bg-bg"
                              }`}
                            >
                              {m.is_admin ? "관리자" : "일반 회원"}
                            </button>
                          </td>
                          <td className="py-2.5 pr-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              title={m.id === currentUserId ? "본인 계정은 스스로 삭제할 수 없어요" : "회원 삭제"}
                              aria-label={m.id === currentUserId ? "본인 계정은 스스로 삭제할 수 없어요" : "회원 삭제"}
                              onClick={() => deleteMember(m)}
                              disabled={deletingMemberId === m.id || m.id === currentUserId}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-b border-border/60 bg-bg">
                            <td colSpan={9} className="px-4 py-4">
                              {m.applied ? (
                                <div className="grid gap-3 text-sm sm:grid-cols-3">
                                  <div>
                                    <p className="text-xs font-medium text-muted">연락처</p>
                                    <p className="text-ink">{m.phone || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted">GitHub</p>
                                    <p className="text-ink">{m.github_id || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted">지원일</p>
                                    <p className="text-ink">{fmtDate(m.applied_at)}</p>
                                  </div>
                                  <div className="sm:col-span-3">
                                    <p className="text-xs font-medium text-muted">지원 동기</p>
                                    <p className="whitespace-pre-wrap text-ink">{m.motivation || "-"}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted">아직 지원서를 제출하지 않았습니다.</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="py-3 pl-4 pr-4 font-medium">제목</th>
                  <th className="py-3 pr-4 font-medium">작성자</th>
                  <th className="py-3 pr-4 font-medium">날짜</th>
                  <th className="py-3 pr-4 font-medium">태그</th>
                  <th className="py-3 pr-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.slug} className="border-b border-border/60 bg-bg">
                    <td className="py-2.5 pl-4 pr-4 font-medium text-navy">
                      <Link href={`/blog/${post.slug}`} className="hover:text-mint-strong">
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-ink">{post.author}</td>
                    <td className="py-2.5 pr-4 text-ink">{fmtDate(post.date)}</td>
                    <td className="py-2.5 pr-4 text-ink">{post.tags.join(", ") || "-"}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/blog/${post.slug}/edit`}
                          title="수정"
                          aria-label="수정"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-navy"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          title="삭제"
                          aria-label="삭제"
                          onClick={() => deletePost(post.slug, post.title)}
                          disabled={deletingSlug === post.slug}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
