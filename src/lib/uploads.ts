import { putBinaryFile, repoBase } from "./github";

const UPLOADS_DIR = "content/blog/uploads";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function isAllowedImageType(type: string): boolean {
  return type in ALLOWED_TYPES;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

function slugifyBase(originalName: string): string {
  const base = originalName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "image";
}

/**
 * 업로드한 이미지는 Vercel 재배포를 기다릴 필요 없이 바로 보이도록
 * raw.githubusercontent.com URL로 참조한다 (public/ 정적 파일은 다음 빌드까지 반영되지 않음).
 */
export async function uploadBlogImage(
  originalName: string,
  mimeType: string,
  base64Content: string
): Promise<{ url: string; path: string }> {
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    throw new Error("지원하지 않는 이미지 형식입니다.");
  }

  const filename = `${Date.now()}-${randomId()}-${slugifyBase(originalName)}.${ext}`;
  const path = `${UPLOADS_DIR}/${filename}`;

  await putBinaryFile(path, base64Content, `blog: upload image ${filename}`);

  const { owner, repo, branch } = repoBase();
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  return { url, path };
}
