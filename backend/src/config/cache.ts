import CacheService, { CacheConfig } from '../services/cacheService';
import CRMCacheService from '../services/crmCacheService';
import { CRMService } from '../services/crmService';
import { logger } from '../utils/logger';

export class CacheManager {
  private static instance: CacheManager;
  private cacheService?: CacheService;
  private crmCacheService?: CRMCacheService;

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const config: CacheConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        ttl: parseInt(process.env.REDIS_DEFAULT_TTL || '900'), // 15 minutes
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'crm'
      };

      // Initialize base cache service
      this.cacheService = CacheService.getInstance(config);
      await this.cacheService.connect();

      // Initialize CRM-specific cache service
      this.crmCacheService = CRMCacheService.getInstance(this.cacheService);

      // Inject cache service into CRM service
      const crmService = CRMService.getInstance();
      crmService.setCacheService(this.crmCacheService);

      logger.info('Cache services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize cache services:', error);
      // Don't throw error - application should work without cache
    }
  }

  async shutdown(): Promise<void> {
    if (this.cacheService) {
      await this.cacheService.disconnect();
      logger.info('Cache services shut down');
    }
  }

  getCacheService(): CacheService | undefined {
    return this.cacheService;
  }

  getCRMCacheService(): CRMCacheService | undefined {
    return this.crmCacheService;
  }

  isAvailable(): boolean {
    return this.cacheService?.isAvailable() || false;
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy' | 'disabled';
    stats?: any;
    error?: string;
  }> {
    if (!this.cacheService) {
      return { status: 'disabled' };
    }

    try {
      if (this.cacheService.isAvailable()) {
        const stats = await this.cacheService.getStats();
        return {
          status: 'healthy',
          stats
        };
      } else {
        return {
          status: 'unhealthy',
          error: 'Cache service not connected'
        };
      }
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Clear all cache (for development/testing)
   */
  async clearAll(): Promise<boolean> {
    if (!this.cacheService) {
      return false;
    }

    try {
      await this.cacheService.flushall();
      logger.warn('All cache cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Clear cache for specific user
   */
  async clearUserCache(userId: string): Promise<boolean> {
    if (!this.crmCacheService) {
      return false;
    }

    try {
      await this.crmCacheService.invalidateUserCache(userId);
      logger.info(`Cleared cache for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to clear user cache for ${userId}:`, error);
      return false;
    }
  }
}

export default CacheManager;