import CacheService from './cacheService';
import { IContact } from '../models/Contact';
import { IDeal, IPipeline } from '../models/Pipeline';
import { logger } from '../utils/logger';

export class CRMCacheService {
  private static instance: CRMCacheService;
  private cacheService: CacheService;

  // Cache TTL configurations (in seconds)
  private readonly CACHE_TTL = {
    CONTACT: 900, // 15 minutes
    CONTACT_LIST: 300, // 5 minutes
    CONTACT_SEARCH: 180, // 3 minutes
    DEAL: 600, // 10 minutes
    DEAL_LIST: 300, // 5 minutes
    PIPELINE: 3600, // 1 hour
    ANALYTICS: 1800, // 30 minutes
    USER_ACTIVITY: 600, // 10 minutes
    CUSTOM_FIELDS: 7200, // 2 hours
  };

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  public static getInstance(cacheService?: CacheService): CRMCacheService {
    if (!CRMCacheService.instance) {
      if (!cacheService) {
        throw new Error('Cache service required for first initialization');
      }
      CRMCacheService.instance = new CRMCacheService(cacheService);
    }
    return CRMCacheService.instance;
  }

  // ===============================
  // CONTACT CACHING
  // ===============================

  /**
   * Cache single contact
   */
  async cacheContact(userId: string, contact: IContact): Promise<void> {
    const key = this.getContactKey(userId, contact._id.toString());
    await this.cacheService.set(key, contact, this.CACHE_TTL.CONTACT);

    // Also cache in user's contact list cache invalidation set
    const listInvalidationKey = this.getContactListInvalidationKey(userId);
    await this.cacheService.sadd(listInvalidationKey, contact._id.toString());
    await this.cacheService.expire(listInvalidationKey, this.CACHE_TTL.CONTACT_LIST);
  }

  /**
   * Get cached contact
   */
  async getCachedContact(userId: string, contactId: string): Promise<IContact | null> {
    const key = this.getContactKey(userId, contactId);
    return await this.cacheService.get<IContact>(key);
  }

  /**
   * Cache contact list
   */
  async cacheContactList(
    userId: string,
    searchParams: any,
    contacts: any
  ): Promise<void> {
    const key = this.getContactListKey(userId, searchParams);
    await this.cacheService.set(key, contacts, this.CACHE_TTL.CONTACT_LIST);
  }

  /**
   * Get cached contact list
   */
  async getCachedContactList(
    userId: string,
    searchParams: any
  ): Promise<any | null> {
    const key = this.getContactListKey(userId, searchParams);
    return await this.cacheService.get(key);
  }

  /**
   * Invalidate contact cache
   */
  async invalidateContact(userId: string, contactId: string): Promise<void> {
    const key = this.getContactKey(userId, contactId);
    await this.cacheService.del(key);

    // Invalidate all contact lists for this user
    await this.invalidateContactLists(userId);

    // Invalidate analytics
    await this.invalidateAnalytics(userId);
  }

  /**
   * Invalidate all contact lists for a user
   */
  async invalidateContactLists(userId: string): Promise<void> {
    const pattern = `contact_list:${userId}:*`;
    await this.cacheService.delPattern(pattern);

    const searchPattern = `contact_search:${userId}:*`;
    await this.cacheService.delPattern(searchPattern);
  }

  /**
   * Bulk invalidate contacts
   */
  async bulkInvalidateContacts(userId: string, contactIds: string[]): Promise<void> {
    const keys = contactIds.map(id => this.getContactKey(userId, id));

    // Delete individual contact caches
    for (const key of keys) {
      await this.cacheService.del(key);
    }

    // Invalidate lists and analytics
    await this.invalidateContactLists(userId);
    await this.invalidateAnalytics(userId);
  }

  // ===============================
  // DEAL CACHING
  // ===============================

  /**
   * Cache single deal
   */
  async cacheDeal(userId: string, deal: IDeal): Promise<void> {
    const key = this.getDealKey(userId, deal._id.toString());
    await this.cacheService.set(key, deal, this.CACHE_TTL.DEAL);
  }

  /**
   * Get cached deal
   */
  async getCachedDeal(userId: string, dealId: string): Promise<IDeal | null> {
    const key = this.getDealKey(userId, dealId);
    return await this.cacheService.get<IDeal>(key);
  }

  /**
   * Cache deal list
   */
  async cacheDealList(
    userId: string,
    searchParams: any,
    deals: any
  ): Promise<void> {
    const key = this.getDealListKey(userId, searchParams);
    await this.cacheService.set(key, deals, this.CACHE_TTL.DEAL_LIST);
  }

  /**
   * Get cached deal list
   */
  async getCachedDealList(
    userId: string,
    searchParams: any
  ): Promise<any | null> {
    const key = this.getDealListKey(userId, searchParams);
    return await this.cacheService.get(key);
  }

  /**
   * Invalidate deal cache
   */
  async invalidateDeal(userId: string, dealId: string): Promise<void> {
    const key = this.getDealKey(userId, dealId);
    await this.cacheService.del(key);

    // Invalidate deal lists
    const pattern = `deal_list:${userId}:*`;
    await this.cacheService.delPattern(pattern);

    // Invalidate analytics
    await this.invalidateAnalytics(userId);
  }

  // ===============================
  // PIPELINE CACHING
  // ===============================

  /**
   * Cache pipeline
   */
  async cachePipeline(userId: string, pipeline: IPipeline): Promise<void> {
    const key = this.getPipelineKey(userId, pipeline._id.toString());
    await this.cacheService.set(key, pipeline, this.CACHE_TTL.PIPELINE);
  }

  /**
   * Get cached pipeline
   */
  async getCachedPipeline(userId: string, pipelineId: string): Promise<IPipeline | null> {
    const key = this.getPipelineKey(userId, pipelineId);
    return await this.cacheService.get<IPipeline>(key);
  }

  /**
   * Cache user's pipelines
   */
  async cacheUserPipelines(userId: string, pipelines: IPipeline[]): Promise<void> {
    const key = this.getUserPipelinesKey(userId);
    await this.cacheService.set(key, pipelines, this.CACHE_TTL.PIPELINE);
  }

  /**
   * Get cached user pipelines
   */
  async getCachedUserPipelines(userId: string): Promise<IPipeline[] | null> {
    const key = this.getUserPipelinesKey(userId);
    return await this.cacheService.get<IPipeline[]>(key);
  }

  /**
   * Invalidate pipeline cache
   */
  async invalidatePipeline(userId: string, pipelineId: string): Promise<void> {
    const key = this.getPipelineKey(userId, pipelineId);
    await this.cacheService.del(key);

    // Invalidate user's pipelines list
    const userPipelinesKey = this.getUserPipelinesKey(userId);
    await this.cacheService.del(userPipelinesKey);
  }

  // ===============================
  // ANALYTICS CACHING
  // ===============================

  /**
   * Cache analytics data
   */
  async cacheAnalytics(userId: string, analyticsType: string, data: any): Promise<void> {
    const key = this.getAnalyticsKey(userId, analyticsType);
    await this.cacheService.set(key, data, this.CACHE_TTL.ANALYTICS);
  }

  /**
   * Get cached analytics
   */
  async getCachedAnalytics(userId: string, analyticsType: string): Promise<any | null> {
    const key = this.getAnalyticsKey(userId, analyticsType);
    return await this.cacheService.get(key);
  }

  /**
   * Invalidate all analytics for a user
   */
  async invalidateAnalytics(userId: string): Promise<void> {
    const pattern = `analytics:${userId}:*`;
    await this.cacheService.delPattern(pattern);
  }

  // ===============================
  // USER ACTIVITY CACHING
  // ===============================

  /**
   * Cache user activity
   */
  async cacheUserActivity(userId: string, activity: any): Promise<void> {
    const key = this.getUserActivityKey(userId);

    // Store as a list with limited size
    await this.cacheService.lpush(key, activity);

    // Keep only latest 100 activities
    // Note: This would require additional Redis commands for trimming
    await this.cacheService.expire(key, this.CACHE_TTL.USER_ACTIVITY);
  }

  /**
   * Get cached user activities
   */
  async getCachedUserActivity(userId: string): Promise<any[] | null> {
    const key = this.getUserActivityKey(userId);

    // For simplicity, we'll use a regular get/set approach
    return await this.cacheService.get<any[]>(key);
  }

  // ===============================
  // CUSTOM FIELDS CACHING
  // ===============================

  /**
   * Cache custom field definitions
   */
  async cacheCustomFields(userId: string, resourceType: string, fields: any[]): Promise<void> {
    const key = this.getCustomFieldsKey(userId, resourceType);
    await this.cacheService.set(key, fields, this.CACHE_TTL.CUSTOM_FIELDS);
  }

  /**
   * Get cached custom field definitions
   */
  async getCachedCustomFields(userId: string, resourceType: string): Promise<any[] | null> {
    const key = this.getCustomFieldsKey(userId, resourceType);
    return await this.cacheService.get<any[]>(key);
  }

  /**
   * Invalidate custom fields cache
   */
  async invalidateCustomFields(userId: string, resourceType?: string): Promise<void> {
    if (resourceType) {
      const key = this.getCustomFieldsKey(userId, resourceType);
      await this.cacheService.del(key);
    } else {
      const pattern = `custom_fields:${userId}:*`;
      await this.cacheService.delPattern(pattern);
    }
  }

  // ===============================
  // RATE LIMITING SUPPORT
  // ===============================

  /**
   * Check rate limit
   */
  async checkRateLimit(userId: string, action: string, limit: number, window: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.cacheService.incr(key, 1);

    if (current === 1) {
      // First request in this window
      await this.cacheService.expire(key, window);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + (window * 1000);

    return {
      allowed: current <= limit,
      remaining,
      resetTime
    };
  }

  // ===============================
  // SESSION CACHING
  // ===============================

  /**
   * Cache user session data
   */
  async cacheSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = `session:${sessionId}`;
    await this.cacheService.set(key, sessionData, ttl);
  }

  /**
   * Get cached session
   */
  async getCachedSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await this.cacheService.get(key);
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.cacheService.del(key);
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Invalidate all cache for a user (use with caution)
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `contact:${userId}:*`,
      `contact_list:${userId}:*`,
      `contact_search:${userId}:*`,
      `deal:${userId}:*`,
      `deal_list:${userId}:*`,
      `pipeline:${userId}:*`,
      `analytics:${userId}:*`,
      `custom_fields:${userId}:*`,
      `user_activity:${userId}`,
    ];

    for (const pattern of patterns) {
      await this.cacheService.delPattern(pattern);
    }

    logger.info(`Invalidated all cache for user: ${userId}`);
  }

  // ===============================
  // PRIVATE KEY GENERATORS
  // ===============================

  private getContactKey(userId: string, contactId: string): string {
    return `contact:${userId}:${contactId}`;
  }

  private getContactListKey(userId: string, searchParams: any): string {
    const paramsHash = this.hashObject(searchParams);
    return `contact_list:${userId}:${paramsHash}`;
  }

  private getContactListInvalidationKey(userId: string): string {
    return `contact_list_invalidation:${userId}`;
  }

  private getDealKey(userId: string, dealId: string): string {
    return `deal:${userId}:${dealId}`;
  }

  private getDealListKey(userId: string, searchParams: any): string {
    const paramsHash = this.hashObject(searchParams);
    return `deal_list:${userId}:${paramsHash}`;
  }

  private getPipelineKey(userId: string, pipelineId: string): string {
    return `pipeline:${userId}:${pipelineId}`;
  }

  private getUserPipelinesKey(userId: string): string {
    return `user_pipelines:${userId}`;
  }

  private getAnalyticsKey(userId: string, analyticsType: string): string {
    return `analytics:${userId}:${analyticsType}`;
  }

  private getUserActivityKey(userId: string): string {
    return `user_activity:${userId}`;
  }

  private getCustomFieldsKey(userId: string, resourceType: string): string {
    return `custom_fields:${userId}:${resourceType}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Get cache statistics for CRM
   */
  async getCRMCacheStats(userId: string): Promise<any> {
    const patterns = [
      'contact:*',
      'contact_list:*',
      'deal:*',
      'deal_list:*',
      'pipeline:*',
      'analytics:*',
    ];

    const stats: any = {};

    for (const pattern of patterns) {
      const keys = await this.cacheService.smembers(`cache_keys:${pattern}`);
      stats[pattern] = keys.length;
    }

    return stats;
  }
}

export default CRMCacheService;