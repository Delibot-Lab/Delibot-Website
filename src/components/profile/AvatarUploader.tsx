"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 512;

async function cropToSquareAndResize(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height, MAX_DIMENSION);
  const sx = (bitmap.width - Math.min(bitmap.width, bitmap.height)) / 2;
  const sy = (bitmap.height - Math.min(bitmap.width, bitmap.height)) / 2;
  const cropSize = Math.min(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, size, size);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.9)
  );
  if (!blob) return file;
  return new File([blob], "avatar.webp", { type: "image/webp" });
}

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function AvatarUploader({
  userId,
  name,
  initialAvatarUrl,
}: {
  userId: string;
  name: string;
  initialAvatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const processed = await cropToSquareAndResize(file);
      const supabase = createClient();
      const path = `${userId}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, processed, { upsert: true, contentType: "image/webp" });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      // 캐시 무효화를 위해 타임스탬프를 붙인다 (같은 경로에 upsert했기 때문).
      const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId);
      if (updateError) throw updateError;

      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-border bg-mint disabled:opacity-60"
        title="프로필 사진 변경"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 업로드 직후 캐시 무효화 쿼리스트링을 붙인 동적 URL
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
            {initials(name)}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-navy/0 text-white opacity-0 transition-opacity group-hover:bg-navy/50 group-hover:opacity-100">
          <Camera className="h-6 w-6" />
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-medium text-mint-strong hover:underline disabled:opacity-60"
      >
        {uploading ? "업로드 중..." : "사진 바꾸기"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
