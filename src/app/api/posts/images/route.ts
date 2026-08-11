import { NextRequest, NextResponse } from "next/server";
import { isAllowedImageType, uploadBlogImage } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/supabase/session";
import { rateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const limited = rateLimit(`upload:${user.id}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "이미지 파일이 필요합니다." }, { status: 400 });
  }
  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: "PNG, JPG, WEBP, GIF, SVG 형식만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "이미지 용량은 8MB를 넘을 수 없습니다." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  try {
    const { url } = await uploadBlogImage(file.name, file.type, base64);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
