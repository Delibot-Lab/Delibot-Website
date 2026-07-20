import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createPost, isValidSlug } from "@/lib/posts";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const slug = str(body?.slug);
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
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." },
      { status: 400 }
    );
  }

  try {
    await createPost({ slug, title, date, excerpt, tags, author, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "글을 저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ ok: true, slug });
}
