import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BackLink } from "@/components/ui/BackLink";
import { PostForm } from "@/components/blog/PostForm";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `새 글 작성 | ${siteConfig.name}`,
};

export default function WritePostPage() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-3xl">
        <BackLink href="/blog" label="목록으로" className="mb-6" />
        <h1 className="mb-10 text-2xl font-bold text-navy">새 글 작성</h1>
        <PostForm mode="create" />
      </Container>
    </section>
  );
}
