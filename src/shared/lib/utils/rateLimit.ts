interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const CLEANUP_THRESHOLD = 10000;

const cleanupExpiredEntries = (windowMs: number) => {
  const now = Date.now();
  const cutoff = now - windowMs;

  for (const [key, entry] of rateLimitMap) {
    const filtered = entry.timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) {
      rateLimitMap.delete(key);
    } else {
      entry.timestamps = filtered;
    }
  }
};

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
}

export const rateLimit = (identifier: string, config: RateLimitConfig): RateLimitResult => {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const entry = rateLimitMap.get(identifier);
  const timestamps = entry ? entry.timestamps.filter((t) => t > windowStart) : [];

  if (timestamps.length >= config.maxRequests) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return { success: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  timestamps.push(now);
  rateLimitMap.set(identifier, { timestamps });

  if (rateLimitMap.size > CLEANUP_THRESHOLD) {
    cleanupExpiredEntries(config.windowMs);
  }

  return { success: true, remaining: config.maxRequests - timestamps.length, retryAfterMs: 0 };
};

const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 10,
};

export const getClientIp = (request: Request): string => {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
};

export const checkAuthRateLimit = (request: Request): RateLimitResult => {
  const ip = getClientIp(request);
  const url = new URL(request.url);
  return rateLimit(`auth:${url.pathname}:${ip}`, AUTH_RATE_LIMIT);
};
