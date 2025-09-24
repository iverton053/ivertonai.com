import { CacheEntry, CacheConfig } from '../types';
import { storage } from './storage';

/**
 * Advanced cache management service with TTL, LRU eviction, and persistence
 */
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private accessOrder: string[];
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config,
    };
    
    this.cache = new Map();
    this.accessOrder = [];
    this.init();
  }

  static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  private init(): void {
    // Start cleanup interval
    this.startCleanupInterval();
    
    // Load persistent cache entries
    this.loadFromStorage();
    
    // Set up beforeunload handler for persistence
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToStorage();
      });
    }
  }

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
    };

    // Remove existing entry to update access order
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }

    // Add to cache and access order
    this.cache.set(key, entry);
    this.accessOrder.push(key);

    // Enforce size limit with LRU eviction
    this.enforceMaxSize();
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    // Update access order
    this.updateAccessOrder(key);
    
    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    return existed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
    expiredEntries: number;
  } {
    const expiredCount = Array.from(this.cache.values())
      .filter(entry => this.isExpired(entry)).length;

    // Estimate memory usage (rough calculation)
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage,
      expiredEntries: expiredCount,
    };
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get keys matching a pattern
   */
  getKeysByPattern(pattern: string | RegExp): string[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this.getKeys().filter(key => regex.test(key));
  }

  /**
   * Invalidate all entries matching a pattern
   */
  invalidateByPattern(pattern: string | RegExp): number {
    const keysToDelete = this.getKeysByPattern(pattern);
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Batch set multiple entries
   */
  setBatch<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  /**
   * Batch get multiple entries
   */
  getBatch<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  /**
   * Set cache entry with refresh callback
   * If data is expired, callback is called to refresh it
   */
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        // Try to get from cache first
        const cached = this.get<T>(key);
        if (cached !== null) {
          resolve(cached);
          return;
        }

        // Not in cache or expired, fetch new data
        const data = await factory();
        this.set(key, data, ttl);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Refresh cache entry by calling factory function
   */
  async refresh<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Extend TTL for existing cache entry
   */
  touch(key: string, additionalTime?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const extension = additionalTime ?? this.config.defaultTTL;
    entry.ttl += extension;
    this.updateAccessOrder(key);
    
    return true;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Persist cache to storage (only non-expired entries)
   */
  saveToStorage(): void {
    try {
      const persistentEntries: Record<string, CacheEntry<any>> = {};
      
      for (const [key, entry] of this.cache.entries()) {
        if (!this.isExpired(entry)) {
          persistentEntries[key] = entry;
        }
      }

      storage.set('cache_data', {
        entries: persistentEntries,
        accessOrder: this.accessOrder,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  /**
   * Load cache from storage
   */
  loadFromStorage(): void {
    try {
      const saved = storage.get<{
        entries: Record<string, CacheEntry<any>>;
        accessOrder: string[];
        timestamp: number;
      }>('cache_data');

      if (!saved) return;

      // Only load if saved recently (within cleanup interval)
      const age = Date.now() - saved.timestamp;
      if (age > this.config.cleanupInterval * 2) {
        return;
      }

      // Restore entries that haven't expired
      Object.entries(saved.entries).forEach(([key, entry]) => {
        if (!this.isExpired(entry)) {
          this.cache.set(key, entry);
        }
      });

      // Restore access order for valid keys
      this.accessOrder = saved.accessOrder.filter(key => this.cache.has(key));
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  /**
   * Export cache data for debugging or migration
   */
  export(): string {
    const exportData = {
      cache: Object.fromEntries(this.cache.entries()),
      accessOrder: this.accessOrder,
      config: this.config,
      timestamp: Date.now(),
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import cache data
   */
  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.cache || !Array.isArray(parsed.accessOrder)) {
        throw new Error('Invalid cache data format');
      }

      this.clear();
      
      // Import entries
      Object.entries(parsed.cache).forEach(([key, entry]: [string, any]) => {
        if (entry && typeof entry === 'object' && 'data' in entry) {
          this.cache.set(key, entry);
        }
      });

      // Import access order
      this.accessOrder = parsed.accessOrder.filter((key: string) => 
        this.cache.has(key)
      );

      return true;
    } catch (error) {
      console.error('Failed to import cache data:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private enforceMaxSize(): void {
    while (this.cache.size > this.config.maxSize && this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
      this.saveToStorage();
    }, this.config.cleanupInterval);
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private calculateHitRate(): number {
    // This is a simplified hit rate calculation
    // In a real implementation, you'd track hits and misses
    const validEntries = Array.from(this.cache.values())
      .filter(entry => !this.isExpired(entry)).length;
    
    return this.cache.size > 0 ? validEntries / this.cache.size : 0;
  }

  /**
   * Destroy cache service
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.saveToStorage();
    this.clear();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.saveToStorage);
    }
  }
}

// Export singleton instance with default config
export const cache = CacheService.getInstance({
  defaultTTL: 5 * 60 * 1000,  // 5 minutes
  maxSize: 200,               // 200 entries max
  cleanupInterval: 2 * 60 * 1000, // cleanup every 2 minutes
});

// Export specialized cache instances for different use cases
export const widgetCache = CacheService.getInstance({
  defaultTTL: 30 * 1000,      // 30 seconds for widgets
  maxSize: 50,
  cleanupInterval: 30 * 1000,
});

export const userCache = CacheService.getInstance({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for user data
  maxSize: 25,
  cleanupInterval: 5 * 60 * 1000,
});

export const analyticsCache = CacheService.getInstance({
  defaultTTL: 2 * 60 * 1000,  // 2 minutes for analytics
  maxSize: 30,
  cleanupInterval: 60 * 1000,
});