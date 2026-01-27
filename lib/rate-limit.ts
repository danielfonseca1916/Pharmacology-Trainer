/**
 * Simple in-memory rate limiter for development
 * For production, use Redis-based rate limiting (e.g., upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { success: boolean; remaining: number; resetAt: number } => {
      const now = Date.now();
      const key = identifier;
      const entry = store.get(key);

      if (!entry || entry.resetAt < now) {
        // New window
        const resetAt = now + config.windowMs;
        store.set(key, { count: 1, resetAt });
        return { success: true, remaining: config.maxRequests - 1, resetAt };
      }

      if (entry.count >= config.maxRequests) {
        // Rate limit exceeded
        return { success: false, remaining: 0, resetAt: entry.resetAt };
      }

      // Increment count
      entry.count++;
      return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
    },
  };
}

// Pre-configured rate limiters
export const loginLimiter = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const registerLimiter = rateLimit({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
});

export const apiLimiter = rateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});
