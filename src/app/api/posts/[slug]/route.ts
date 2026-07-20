import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deletePost, isValidSlug, updatePost } from "@/lib/posts";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);

  const newSlug = str(body?.slug) || slug;
  const title = str(body?.title);
  const excerpt = str(body?.excerpt);
  const author = str(body?.author) || "CBSH DeliBot Lab";
  const date = str(body?.date) || new Date().toISOString().slice(0, 10);
  const content = typeof body?.content === "string" ? body.content : "";
  const tags = Array.isArray(body?.tags)
    ? body.tags
        .filter((t: unknown): t is string => typeof t === "string" && t.trim() !== "")
        .map((t: string) => t.trim())
    : [];

  if (!title || !content) {
    return NextResponse.json(
      { error: "제목과 본문은 필수입니다." },
      { status: 400 }
    );
  }
  if (!isValidSlug(newSlug)) {
    return NextResponse.json(
      { error: "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." },
      { status: 400 }
    );
  }

  try {
    await updatePost(slug, {
      slug: newSlug,
      title,
      date,
      excerpt,
      tags,
      author,
      content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "글을 수정하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (newSlug !== slug) revalidatePath(`/blog/${newSlug}`);

  return NextResponse.json({ ok: true, slug: newSlug });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  void request;
  const { slug } = await params;

  try {
    await deletePost(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "글을 삭제하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ ok: true });
}
