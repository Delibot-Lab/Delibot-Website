import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { BackLink } from "@/components/ui/BackLink";
import { PostForm } from "@/components/blog/PostForm";
import { getPostBySlug } from "@/lib/posts";

export const metadata: Metadata = {
  title: "글 수정",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-3xl">
        <BackLink
          href={`/blog/${post.slug}`}
          label="글로 돌아가기"
          className="mb-6"
        />
        <h1 className="mb-10 text-2xl font-bold text-navy">글 수정</h1>
        <PostForm mode="edit" initialPost={post} />
      </Container>
    </section>
  );
}
