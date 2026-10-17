type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

/** Best-effort limiter. Each server instance has its own memory; it is not a global lock. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (buckets.size > 2000) {
    for (const [name, bucket] of buckets) if (bucket.reset <= now) buckets.delete(name);
  }
  const current = buckets.get(key);
  if (!current || current.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const ip = first || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 64);
}

export function resetRateLimits(): void {
  buckets.clear();
}
