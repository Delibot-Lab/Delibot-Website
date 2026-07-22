import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "@/components/blog/PostCard";
import { AdminOnly } from "@/components/ui/AdminOnly";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `블로그 | ${siteConfig.name}`,
  description: `${siteConfig.labName}의 개발 기록과 소식을 전합니다.`,
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  let loadError = false;

  try {
    posts = await getAllPosts();
  } catch {
    // GitHub 자격증명이 없거나 API가 일시적으로 응답하지 않아도
    // 페이지 전체가 죽지 않고 안내 문구를 보여준다.
    loadError = true;
  }

  return (
    <section className="bg-bg py-20 md:py-28">
      <Container>
        <Reveal className="mb-12 flex flex-col items-center gap-4 text-center">
          <span className="inline-flex w-fit items-center rounded-full bg-mint/15 px-4 py-1.5 text-sm font-semibold text-mint-strong">
            BLOG
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
            개발 기록
          </h1>
          <p className="max-w-xl text-muted">
            Delibot을 만들면서 겪은 문제와 해결 과정을 기록합니다.
          </p>
          <AdminOnly>
            <Link
              href="/blog/write"
              className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              새 글 작성
            </Link>
          </AdminOnly>
        </Reveal>

        {loadError ? (
          <p className="text-center text-muted">
            글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted">아직 작성된 글이 없습니다.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} delay={i * 0.06} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export const dynamic = "force-dynamic";
