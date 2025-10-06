import { cacheService } from "../middleware/cache.js";

export class BaseService {
  constructor(Model, options = {}) {
    this.Model = Model;
    this.cacheTTL = options.cacheTTL || 600; // 10 minutes
    this.useCache = options.useCache !== false;
  }

  // Generate cache key
  getCacheKey(operation, params) {
    return `${this.Model.modelName}_${operation}_${JSON.stringify(params)}`;
  }

  // Find by ID with caching
  async findById(id, options = {}) {
    const cacheKey = this.getCacheKey("findById", { id, options });

    if (this.useCache) {
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const result = await this.Model.findById(id, options);
    if (result && this.useCache) {
      await cacheService.set(cacheKey, result, this.cacheTTL);
    }

    return result;
  }

  // Find with query and caching
  async find(query = {}, options = {}) {
    const cacheKey = this.getCacheKey("find", { query, options });

    if (this.useCache) {
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;
    }

    const result = await this.Model.find(query, options);
    if (result && this.useCache) {
      await cacheService.set(cacheKey, result, this.cacheTTL);
    }

    return result;
  }

  // Create with cache invalidation
  async create(data) {
    const result = await this.Model.create(data);
    if (this.useCache) {
      await cacheService.flush();
    }
    return result;
  }

  // Update with cache invalidation
  async update(id, data, options = {}) {
    const result = await this.Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });

    if (this.useCache) {
      await cacheService.flush();
    }

    return result;
  }

  // Delete with cache invalidation
  async delete(id) {
    const result = await this.Model.findByIdAndDelete(id);
    if (this.useCache) {
      await cacheService.flush();
    }
    return result;
  }
}
