const AVATAR_COLORS = ["bg-mint", "bg-peach", "bg-teal"];

function initials(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

function colorFor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function Avatar({
  userId,
  name,
  avatarUrl,
  size = 8,
}: {
  userId: string;
  name: string;
  avatarUrl: string | null | undefined;
  size?: number;
}) {
  const dimension = `${size / 4}rem`;
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 동적 사용자 업로드 이미지(캐시 무효화 쿼리스트링 포함)
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: dimension, height: dimension }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorFor(userId)}`}
    >
      {initials(name)}
    </div>
  );
}
