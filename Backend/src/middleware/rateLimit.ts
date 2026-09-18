import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function rateLimit(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = rateLimitStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      rateLimitStore.set(key, record);
    }

    // Keep only timestamps within window
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= limit) {
      return res.status(429).json({
        ok: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: `Too many requests. Limit is ${limit} per ${Math.round(windowMs / 1000)} seconds.`,
        },
      });
    }

    record.timestamps.push(now);
    next();
  };
}
