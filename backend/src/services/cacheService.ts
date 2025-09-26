import Redis from 'redis';
import { logger } from '../utils/logger';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number; // Default TTL in seconds
  keyPrefix: string;
}

export class CacheService {
  private static instance: CacheService;
  private client: Redis.RedisClientType | null = null;
  private isConnected: boolean = false;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  public static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance) {
      if (!config) {
        throw new Error('Cache configuration required for first initialization');
      }
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    try {
      this.client = Redis.createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
        },
        password: this.config.password,
        database: this.config.db,
        name: 'crm-cache'
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
      });

      this.client.on('end', () => {
        logger.info('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}:${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      logger.warn('Cache not available, skipping get operation');
      return null;
    }

    try {
      const result = await this.client!.get(this.generateKey(key));
      if (result) {
        return JSON.parse(result) as T;
      }
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn('Cache not available, skipping set operation');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.config.ttl;

      await this.client!.setEx(this.generateKey(key), expiry, serialized);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.del(this.generateKey(key));
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const keys = await this.client!.keys(this.generateKey(pattern));
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client!.del(keys);
      return result;
    } catch (error) {
      logger.error(`Cache delete pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.exists(this.generateKey(key));
      return result > 0;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiry for existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.expire(this.generateKey(key), ttl);
      return result;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isAvailable() || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const prefixedKeys = keys.map(key => this.generateKey(key));
      const results = await this.client!.mGet(prefixedKeys);

      return results.map(result => {
        if (result) {
          try {
            return JSON.parse(result) as T;
          } catch {
            return null;
          }
        }
        return null;
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs
   */
  async mset(keyValues: Record<string, any>, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const pipeline = this.client!.multi();
      const expiry = ttl || this.config.ttl;

      Object.entries(keyValues).forEach(([key, value]) => {
        const serialized = JSON.stringify(value);
        pipeline.setEx(this.generateKey(key), expiry, serialized);
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Increment numeric value
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const result = await this.client!.incrBy(this.generateKey(key), increment);
      return result;
    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Add item to set
   */
  async sadd(key: string, member: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.sAdd(this.generateKey(key), member);
      return result > 0;
    } catch (error) {
      logger.error(`Cache sadd error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove item from set
   */
  async srem(key: string, member: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.sRem(this.generateKey(key), member);
      return result > 0;
    } catch (error) {
      logger.error(`Cache srem error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if item is in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.sIsMember(this.generateKey(key), member);
      return result;
    } catch (error) {
      logger.error(`Cache sismember error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all members of set
   */
  async smembers(key: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const result = await this.client!.sMembers(this.generateKey(key));
      return result;
    } catch (error) {
      logger.error(`Cache smembers error for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Push item to list
   */
  async lpush(key: string, value: any): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const serialized = JSON.stringify(value);
      const result = await this.client!.lPush(this.generateKey(key), serialized);
      return result;
    } catch (error) {
      logger.error(`Cache lpush error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Pop item from list
   */
  async lpop<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const result = await this.client!.lPop(this.generateKey(key));
      if (result) {
        return JSON.parse(result) as T;
      }
      return null;
    } catch (error) {
      logger.error(`Cache lpop error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.isAvailable()) {
      return { available: false };
    }

    try {
      const info = await this.client!.info('memory');
      const keyspace = await this.client!.info('keyspace');

      return {
        available: true,
        memory: info,
        keyspace: keyspace,
        connected: this.isConnected
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async flushall(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.flushAll();
      logger.warn('Cache flushed - all keys deleted');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

export default CacheService;