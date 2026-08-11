import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BackLink } from "@/components/ui/BackLink";
import { PostForm } from "@/components/blog/PostForm";
import { getCurrentUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "새 글 작성",
  robots: { index: false, follow: false },
};

export default async function WritePostPage() {
  const user = await getCurrentUser();
  let defaultAuthor: string | undefined;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    defaultAuthor = data?.name ?? undefined;
  }

  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-3xl">
        <BackLink href="/blog" label="목록으로" className="mb-6" />
        <h1 className="mb-10 text-2xl font-bold text-navy">새 글 작성</h1>
        <PostForm mode="create" defaultAuthor={defaultAuthor} />
      </Container>
    </section>
  );
}
