import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import CacheService from '../services/cacheService';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export class RateLimitService {
  private static instance: RateLimitService;
  private limiters: Map<string, any> = new Map();
  private cacheService?: CacheService;
  private useRedis: boolean = false;

  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  setCacheService(cacheService: CacheService): void {
    this.cacheService = cacheService;
    this.useRedis = cacheService.isAvailable();
  }

  /**
   * Create a rate limiter instance
   */
  private createLimiter(key: string, config: {
    points: number;
    duration: number;
    blockDuration?: number;
  }): any {
    if (this.limiters.has(key)) {
      return this.limiters.get(key);
    }

    let limiter;

    if (this.useRedis && this.cacheService) {
      // Use Redis-based rate limiter
      limiter = new RateLimiterRedis({
        storeClient: (this.cacheService as any).client, // Access Redis client
        keyPrefix: `rate_limit_${key}`,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration || config.duration
      });
    } else {
      // Use memory-based rate limiter
      limiter = new RateLimiterMemory({
        keyPrefix: `rate_limit_${key}`,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration || config.duration
      });
    }

    this.limiters.set(key, limiter);
    return limiter;
  }

  /**
   * Create rate limiting middleware
   */
  createRateLimit(config: RateLimitConfig) {
    const limiter = this.createLimiter(`general_${Date.now()}`, {
      points: config.max,
      duration: Math.floor(config.windowMs / 1000)
    });

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = config.keyGenerator ? config.keyGenerator(req) : this.getClientKey(req);

        await limiter.consume(key);

        // Set rate limit headers
        if (config.standardHeaders !== false) {
          const limiterRes = await limiter.get(key);
          this.setRateLimitHeaders(res, config, limiterRes);
        }

        next();
      } catch (rateLimiterRes) {
        if (rateLimiterRes instanceof Error) {
          logger.error('Rate limiter error:', rateLimiterRes);
          return next();
        }

        // Rate limit exceeded
        this.handleRateLimit(req, res, config, rateLimiterRes as RateLimiterRes);
      }
    };
  }

  /**
   * API-specific rate limiting
   */
  createAPIRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // 1000 requests per window
      message: 'Too many API requests, please try again later.',
      standardHeaders: true,
      keyGenerator: (req: AuthRequest) => {
        // Rate limit by user ID if authenticated, otherwise by IP
        return req.userId || this.getClientKey(req);
      }
    });
  }

  /**
   * Authentication rate limiting
   */
  createAuthRateLimit() {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 attempts per window
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      skipSuccessfulRequests: true,
      keyGenerator: (req: Request) => {
        // Rate limit by IP for auth attempts
        return `auth_${this.getClientKey(req)}`;
      }
    });
  }

  /**
   * Bulk operation rate limiting
   */
  createBulkOperationRateLimit() {
    const limiter = this.createLimiter('bulk_operations', {
      points: 10, // 10 bulk operations
      duration: 60 * 60, // per hour
      blockDuration: 60 * 60 // block for 1 hour
    });

    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const key = req.userId || this.getClientKey(req);

        // Check the size of the bulk operation
        const operationSize = this.getBulkOperationSize(req.body);
        const pointsToConsume = Math.max(1, Math.floor(operationSize / 100)); // 1 point per 100 items

        await limiter.consume(key, pointsToConsume);
        next();
      } catch (rateLimiterRes) {
        if (rateLimiterRes instanceof Error) {
          logger.error('Bulk operation rate limiter error:', rateLimiterRes);
          return next();
        }

        res.status(429).json({
          success: false,
          error: 'Bulk operation rate limit exceeded',
          retryAfter: Math.round((rateLimiterRes as RateLimiterRes).msBeforeNext / 1000)
        });
      }
    };
  }

  /**
   * Search rate limiting (more restrictive for expensive operations)
   */
  createSearchRateLimit() {
    return this.createRateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // 60 searches per minute
      message: 'Search rate limit exceeded, please slow down.',
      keyGenerator: (req: AuthRequest) => {
        return `search_${req.userId || this.getClientKey(req)}`;
      }
    });
  }

  /**
   * Export rate limiting (very restrictive)
   */
  createExportRateLimit() {
    const limiter = this.createLimiter('export_operations', {
      points: 5, // 5 exports
      duration: 60 * 60, // per hour
      blockDuration: 60 * 60
    });

    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const key = req.userId || this.getClientKey(req);
        await limiter.consume(key);
        next();
      } catch (rateLimiterRes) {
        if (rateLimiterRes instanceof Error) {
          logger.error('Export rate limiter error:', rateLimiterRes);
          return next();
        }

        res.status(429).json({
          success: false,
          error: 'Export rate limit exceeded. Maximum 5 exports per hour.',
          retryAfter: Math.round((rateLimiterRes as RateLimiterRes).msBeforeNext / 1000)
        });
      }
    };
  }

  /**
   * Dynamic rate limiting based on user tier
   */
  createTierBasedRateLimit() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return next();
        }

        const userTier = req.user.subscriptionTier || 'free';
        const limiterConfig = this.getTierLimits(userTier);

        const limiter = this.createLimiter(`tier_${userTier}`, limiterConfig);
        const key = req.userId!;

        await limiter.consume(key);
        next();
      } catch (rateLimiterRes) {
        if (rateLimiterRes instanceof Error) {
          logger.error('Tier-based rate limiter error:', rateLimiterRes);
          return next();
        }

        res.status(429).json({
          success: false,
          error: 'API rate limit exceeded for your subscription tier.',
          retryAfter: Math.round((rateLimiterRes as RateLimiterRes).msBeforeNext / 1000),
          upgrade: req.user?.subscriptionTier === 'free' ? 'Consider upgrading your subscription for higher limits.' : undefined
        });
      }
    };
  }

  /**
   * Progressive rate limiting (increases penalties for repeat offenders)
   */
  createProgressiveRateLimit() {
    const shortLimiter = this.createLimiter('progressive_short', {
      points: 100,
      duration: 60 // 1 minute
    });

    const longLimiter = this.createLimiter('progressive_long', {
      points: 1000,
      duration: 60 * 60 // 1 hour
    });

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.getClientKey(req);

        // Try short-term limit first
        await shortLimiter.consume(key);

        // Then check long-term limit
        await longLimiter.consume(key);

        next();
      } catch (rateLimiterRes) {
        if (rateLimiterRes instanceof Error) {
          logger.error('Progressive rate limiter error:', rateLimiterRes);
          return next();
        }

        // Determine which limit was hit
        const blockDuration = (rateLimiterRes as RateLimiterRes).msBeforeNext;
        const isLongTerm = blockDuration > 60 * 1000;

        res.status(429).json({
          success: false,
          error: isLongTerm ? 'Long-term rate limit exceeded' : 'Short-term rate limit exceeded',
          retryAfter: Math.round(blockDuration / 1000),
          type: isLongTerm ? 'long_term' : 'short_term'
        });
      }
    };
  }

  /**
   * Get client identification key
   */
  private getClientKey(req: Request): string {
    // Try to get real IP from various headers
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const clientIP = forwarded?.split(',')[0] || realIP || req.connection.remoteAddress || req.ip;

    return clientIP.replace(/:/g, '_'); // Replace colons for Redis key compatibility
  }

  /**
   * Get rate limits based on user tier
   */
  private getTierLimits(tier: string): { points: number; duration: number } {
    const limits = {
      free: { points: 100, duration: 60 * 60 }, // 100 per hour
      basic: { points: 500, duration: 60 * 60 }, // 500 per hour
      pro: { points: 2000, duration: 60 * 60 }, // 2000 per hour
      enterprise: { points: 10000, duration: 60 * 60 } // 10000 per hour
    };

    return limits[tier as keyof typeof limits] || limits.free;
  }

  /**
   * Calculate bulk operation size
   */
  private getBulkOperationSize(body: any): number {
    if (body.contactIds && Array.isArray(body.contactIds)) {
      return body.contactIds.length;
    }
    if (body.contacts && Array.isArray(body.contacts)) {
      return body.contacts.length;
    }
    return 1;
  }

  /**
   * Set rate limit headers
   */
  private setRateLimitHeaders(res: Response, config: RateLimitConfig, limiterRes?: RateLimiterRes): void {
    if (limiterRes) {
      res.set({
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': limiterRes.remainingPoints?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + limiterRes.msBeforeNext).toISOString()
      });
    }
  }

  /**
   * Handle rate limit exceeded
   */
  private handleRateLimit(
    req: Request,
    res: Response,
    config: RateLimitConfig,
    rateLimiterRes: RateLimiterRes
  ): void {
    const retryAfter = Math.round(rateLimiterRes.msBeforeNext / 1000);

    res.set({
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString()
    });

    logger.warn('Rate limit exceeded:', {
      ip: this.getClientKey(req),
      userAgent: req.headers['user-agent'],
      path: req.path,
      retryAfter
    });

    res.status(429).json({
      success: false,
      error: config.message || 'Too many requests',
      retryAfter
    });
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(key: string): Promise<any> {
    try {
      const stats: any = {};

      for (const [limiterKey, limiter] of this.limiters.entries()) {
        try {
          const result = await limiter.get(key);
          stats[limiterKey] = {
            remainingPoints: result?.remainingPoints || null,
            msBeforeNext: result?.msBeforeNext || null,
            isBlocked: (result?.remainingPoints || 1) <= 0
          };
        } catch (error) {
          stats[limiterKey] = { error: error.message };
        }
      }

      return stats;
    } catch (error) {
      logger.error('Error getting rate limit stats:', error);
      throw error;
    }
  }

  /**
   * Reset rate limits for a key (admin function)
   */
  async resetRateLimit(key: string, limiterName?: string): Promise<void> {
    try {
      if (limiterName && this.limiters.has(limiterName)) {
        const limiter = this.limiters.get(limiterName);
        await limiter.delete(key);
        logger.info(`Reset rate limit for ${key} in limiter ${limiterName}`);
      } else {
        // Reset all limiters for this key
        for (const [limiterKey, limiter] of this.limiters.entries()) {
          try {
            await limiter.delete(key);
          } catch (error) {
            logger.warn(`Failed to reset limiter ${limiterKey} for key ${key}:`, error);
          }
        }
        logger.info(`Reset all rate limits for ${key}`);
      }
    } catch (error) {
      logger.error(`Error resetting rate limit for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get all active rate limiters
   */
  getActiveLimiters(): string[] {
    return Array.from(this.limiters.keys());
  }

  /**
   * Clear all rate limiters (for testing)
   */
  clearAllLimiters(): void {
    this.limiters.clear();
    logger.info('Cleared all rate limiters');
  }
}

export default RateLimitService;