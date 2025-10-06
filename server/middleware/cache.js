import NodeCache from "node-cache";

class CacheService {
  constructor(ttlSeconds = 600) {
    // Default 10 minutes
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = null) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  // Middleware factory for route caching
  middleware(duration = 600) {
    return (req, res, next) => {
      const key = `__express__${req.originalUrl || req.url}`;
      const cachedResponse = this.get(key);

      if (cachedResponse) {
        res.json(cachedResponse);
        return;
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (body) => {
        originalJson.call(res, body);
        this.set(key, body, duration);
      };

      next();
    };
  }
}

export const cacheService = new CacheService();
export const cacheMiddleware = (duration) => cacheService.middleware(duration);
