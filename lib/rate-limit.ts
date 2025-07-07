// Simple in-memory rate limiting
// Note: For production, use Redis or a proper rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
    };
  }

  if (store[key].count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    };
  }

  store[key].count++;
  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  };
}

export function getClientIdentifier(req: any): string {
  // Use IP address as identifier
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress;
  return ip || "unknown";
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60 * 1000); // Clean up every minute
