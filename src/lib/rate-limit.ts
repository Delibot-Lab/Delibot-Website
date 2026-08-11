type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// 마지막 정리 이후 오래된 버킷을 주기적으로 비워 메모리 누수를 막는다.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * 서버리스 인스턴스 하나의 메모리 안에서만 동작하는 단순 고정 윈도우 레이트리밋.
 * 여러 인스턴스에 분산되면 완벽히 정확하진 않지만, 별도 유료 서비스(Upstash 등)
 * 없이도 스팸/오남용을 상당히 줄여준다. 인증된 사용자 id를 키로 쓰는 걸 권장.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}
