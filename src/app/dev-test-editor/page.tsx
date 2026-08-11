import { Container } from "@/components/ui/Container";
import { PostForm } from "@/components/blog/PostForm";

export default function DevTestEditorPage() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-3xl">
        <h1 className="mb-10 text-2xl font-bold text-navy">새 글 작성</h1>
        <PostForm mode="create" />
      </Container>
    </section>
  );
}
