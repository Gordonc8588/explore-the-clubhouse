/**
 * In-memory token bucket rate limiter for API protection
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Maximum number of tokens (requests) allowed */
  maxTokens: number;
  /** Time window in milliseconds for token refill */
  refillInterval: number;
  /** Number of tokens to refill per interval */
  refillRate: number;
}

const defaultOptions: RateLimitOptions = {
  maxTokens: 5,
  refillInterval: 60 * 1000, // 1 minute
  refillRate: 5,
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param options - Rate limiting configuration
 * @returns Object with success boolean and remaining tokens
 */
export function rateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): { success: boolean; remaining: number; reset: number } {
  const config = { ...defaultOptions, ...options };
  const now = Date.now();

  let entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First request from this identifier
    entry = {
      tokens: config.maxTokens - 1,
      lastRefill: now,
    };
    rateLimitStore.set(identifier, entry);
    return {
      success: true,
      remaining: entry.tokens,
      reset: now + config.refillInterval,
    };
  }

  // Calculate tokens to add based on time elapsed
  const timePassed = now - entry.lastRefill;
  const intervalsElapsed = Math.floor(timePassed / config.refillInterval);

  if (intervalsElapsed > 0) {
    // Refill tokens
    entry.tokens = Math.min(
      config.maxTokens,
      entry.tokens + intervalsElapsed * config.refillRate
    );
    entry.lastRefill = now;
  }

  if (entry.tokens > 0) {
    // Consume a token
    entry.tokens -= 1;
    rateLimitStore.set(identifier, entry);
    return {
      success: true,
      remaining: entry.tokens,
      reset: entry.lastRefill + config.refillInterval,
    };
  }

  // No tokens available
  return {
    success: false,
    remaining: 0,
    reset: entry.lastRefill + config.refillInterval,
  };
}

/**
 * Get the client IP address from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback
  return "unknown";
}

/**
 * Clean up old entries to prevent memory leaks
 * Should be called periodically in production
 */
export function cleanupRateLimitStore(maxAge: number = 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRefill > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}
