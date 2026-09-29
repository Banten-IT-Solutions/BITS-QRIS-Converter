export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 30;
export const RATE_LIMIT_MAX_ENTRIES = 10_000;

type Entry = { count: number; resetAt: number };

export function createRateLimiter(
  options: {
    windowMs?: number;
    maxRequests?: number;
    maxEntries?: number;
  } = {},
) {
  const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? RATE_LIMIT_MAX_REQUESTS;
  const maxEntries = options.maxEntries ?? RATE_LIMIT_MAX_ENTRIES;
  const entries = new Map<string, Entry>();

  return {
    check(key: string, now = Date.now()) {
      let entry = entries.get(key);
      if (!entry || now >= entry.resetAt) {
        // Bound memory: purge expired entries, then evict oldest insertion if still full.
        // Per-isolate storage is best-effort; isolate recycling resets limits, while eviction weakens them under high key cardinality.
        if (!entry && entries.size >= maxEntries) {
          for (const [storedKey, storedEntry] of entries) {
            if (now >= storedEntry.resetAt) entries.delete(storedKey);
          }
          if (entries.size >= maxEntries) {
            const oldestKey = entries.keys().next().value;
            if (oldestKey !== undefined) entries.delete(oldestKey);
          }
        }
        entry = { count: 0, resetAt: now + windowMs };
        entries.set(key, entry);
      }

      const allowed = entry.count < maxRequests;
      if (allowed) entry.count += 1;
      return {
        allowed,
        remaining: Math.max(0, maxRequests - entry.count),
        resetAt: entry.resetAt,
        retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      };
    },
    get size() {
      return entries.size;
    },
  };
}

export function getRateLimitKey(headers: Headers): string {
  const clientIp = headers.get('cf-connecting-ip')?.trim();
  if (clientIp) return clientIp;
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || 'unknown';
}

export const convertRateLimiter = createRateLimiter();
