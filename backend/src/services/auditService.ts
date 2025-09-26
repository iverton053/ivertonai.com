import mongoose from 'mongoose';
import AuditLog, { IAuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export interface AuditContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  source?: 'web' | 'api' | 'import' | 'automation' | 'sync';
  reason?: string;
  batch?: boolean;
  batchId?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  operation: 'ADD' | 'REMOVE' | 'MODIFY';
}

export class AuditService {
  private static instance: AuditService;

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an audit entry
   */
  async logAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MERGE' | 'RESTORE',
    resourceType: 'Contact' | 'Deal' | 'Pipeline' | 'Activity' | 'User',
    resourceId: string,
    changes: FieldChange[],
    context: AuditContext
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        userId: new mongoose.Types.ObjectId(context.userId),
        action,
        resourceType,
        resourceId: new mongoose.Types.ObjectId(resourceId),
        changes,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        requestId: context.requestId,
        metadata: {
          source: context.source || 'web',
          reason: context.reason,
          batch: context.batch || false,
          batchId: context.batchId
        }
      });

      await auditLog.save();
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log contact creation
   */
  async logContactCreate(contactId: string, contactData: any, context: AuditContext): Promise<void> {
    const changes: FieldChange[] = Object.keys(contactData).map(field => ({
      field,
      oldValue: null,
      newValue: contactData[field],
      operation: 'ADD'
    }));

    await this.logAction('CREATE', 'Contact', contactId, changes, context);
  }

  /**
   * Log contact update
   */
  async logContactUpdate(
    contactId: string,
    oldData: any,
    newData: any,
    context: AuditContext
  ): Promise<void> {
    const changes: FieldChange[] = [];

    // Compare old and new data
    const allFields = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const field of allFields) {
      const oldValue = oldData[field];
      const newValue = newData[field];

      if (this.isValueChanged(oldValue, newValue)) {
        changes.push({
          field,
          oldValue,
          newValue,
          operation: 'MODIFY'
        });
      }
    }

    if (changes.length > 0) {
      await this.logAction('UPDATE', 'Contact', contactId, changes, context);
    }
  }

  /**
   * Log contact deletion (soft delete)
   */
  async logContactDelete(contactId: string, contactData: any, context: AuditContext): Promise<void> {
    const changes: FieldChange[] = [{
      field: 'isActive',
      oldValue: true,
      newValue: false,
      operation: 'MODIFY'
    }];

    await this.logAction('DELETE', 'Contact', contactId, changes, context);
  }

  /**
   * Log contact merge
   */
  async logContactMerge(
    primaryContactId: string,
    secondaryContactId: string,
    mergedData: any,
    context: AuditContext
  ): Promise<void> {
    const changes: FieldChange[] = [{
      field: 'merged_from',
      oldValue: null,
      newValue: secondaryContactId,
      operation: 'ADD'
    }];

    // Add specific merged fields
    Object.keys(mergedData).forEach(field => {
      changes.push({
        field: `merged_${field}`,
        oldValue: null,
        newValue: mergedData[field],
        operation: 'ADD'
      });
    });

    await this.logAction('MERGE', 'Contact', primaryContactId, changes, {
      ...context,
      reason: `Merged contact ${secondaryContactId} into ${primaryContactId}`
    });
  }

  /**
   * Log deal creation
   */
  async logDealCreate(dealId: string, dealData: any, context: AuditContext): Promise<void> {
    const changes: FieldChange[] = Object.keys(dealData).map(field => ({
      field,
      oldValue: null,
      newValue: dealData[field],
      operation: 'ADD'
    }));

    await this.logAction('CREATE', 'Deal', dealId, changes, context);
  }

  /**
   * Log deal stage change
   */
  async logDealStageChange(
    dealId: string,
    oldStage: string,
    newStage: string,
    context: AuditContext
  ): Promise<void> {
    const changes: FieldChange[] = [{
      field: 'currentStage',
      oldValue: oldStage,
      newValue: newStage,
      operation: 'MODIFY'
    }];

    await this.logAction('UPDATE', 'Deal', dealId, changes, {
      ...context,
      reason: `Deal moved from ${oldStage} to ${newStage}`
    });
  }

  /**
   * Get audit history for a resource
   */
  async getResourceAuditHistory(
    resourceType: 'Contact' | 'Deal' | 'Pipeline' | 'Activity' | 'User',
    resourceId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    audits: IAuditLog[];
    total: number;
  }> {
    try {
      const query = {
        resourceType,
        resourceId: new mongoose.Types.ObjectId(resourceId)
      };

      const [audits, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .populate('userId', 'firstName lastName email')
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      return { audits, total };
    } catch (error) {
      logger.error('Error fetching audit history:', error);
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivityLog(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    resourceType?: 'Contact' | 'Deal' | 'Pipeline' | 'Activity' | 'User'
  ): Promise<{
    audits: IAuditLog[];
    total: number;
  }> {
    try {
      const query: any = {
        userId: new mongoose.Types.ObjectId(userId)
      };

      if (resourceType) {
        query.resourceType = resourceType;
      }

      const [audits, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      return { audits, total };
    } catch (error) {
      logger.error('Error fetching user activity log:', error);
      throw error;
    }
  }

  /**
   * Compare values to detect changes
   */
  private isValueChanged(oldValue: any, newValue: any): boolean {
    // Handle null/undefined cases
    if (oldValue === null || oldValue === undefined) {
      return newValue !== null && newValue !== undefined;
    }
    if (newValue === null || newValue === undefined) {
      return oldValue !== null && oldValue !== undefined;
    }

    // Handle arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      return JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort());
    }

    // Handle objects
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }

    // Handle primitives
    return oldValue !== newValue;
  }

  /**
   * Clean up old audit logs (manual cleanup if TTL not working)
   */
  async cleanupOldAudits(daysToKeep: number = 730): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} old audit logs`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Error cleaning up audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(userId?: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const matchStage: any = {
        createdAt: { $gte: startDate }
      };

      if (userId) {
        matchStage.userId = new mongoose.Types.ObjectId(userId);
      }

      const stats = await AuditLog.aggregate([
        { $match: matchStage },
        {
          $facet: {
            byAction: [
              { $group: { _id: '$action', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            byResourceType: [
              { $group: { _id: '$resourceType', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            bySource: [
              { $group: { _id: '$metadata.source', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            totalActions: [
              { $count: 'count' }
            ],
            dailyActivity: [
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: -1 } }
            ]
          }
        }
      ]);

      return stats[0];
    } catch (error) {
      logger.error('Error getting audit statistics:', error);
      throw error;
    }
  }
}

export default AuditService;