import "server-only";

/**
 * Minimal in-process sliding-window rate limiter. It bounds abuse of the
 * expensive PDF endpoint per instance; for global limits across serverless
 * instances, front it with the Vercel WAF or Upstash (see SECURITY.md).
 */
type Entry = number[];
const buckets = new Map<string, Entry>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { max = 20, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  const ok = recent.length <= max;
  return {
    ok,
    remaining: Math.max(0, max - recent.length),
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  };
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
