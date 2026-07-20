import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { isAuthenticated } from "@/lib/session";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    // GitHub 자격증명이 없거나 API가 일시적으로 응답하지 않아도 빌드는 통과시키고,
    // dynamicParams(아래)로 요청 시점에 개별 글을 렌더링한다.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const admin = await isAuthenticated();

  return (
    <article className="bg-bg py-16 md:py-24">
      <Container>
        <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            {admin && (
              <>
                <span>·</span>
                <Link
                  href={`/blog/${post.slug}/edit`}
                  className="font-medium text-mint-strong"
                >
                  수정
                </Link>
              </>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <MarkdownRenderer content={post.content} />
        </Reveal>
      </Container>
    </article>
  );
}
