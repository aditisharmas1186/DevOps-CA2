import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

let store;

if (process.env.REDIS_URL) {
  const redis = new Redis(process.env.REDIS_URL);
  store = new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  });
}

const createLimiter = (options) =>
  rateLimit({
    store,
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100,
    message: options.message || "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API limiter
export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

// Auth routes limiter (stricter)
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many login attempts, please try again later",
});

// AI routes limiter (based on plan)
export const aiLimiter = (req, res, next) => {
  const limits = {
    free: 10,
    pro: 100,
    enterprise: 1000,
  };

  const userPlan = req.user?.subscription?.plan || "free";
  const limiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: limits[userPlan],
    message: `AI request limit reached for your ${userPlan} plan`,
  });

  return limiter(req, res, next);
};

// File upload limiter
export const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: "Too many file uploads, please try again later",
});
