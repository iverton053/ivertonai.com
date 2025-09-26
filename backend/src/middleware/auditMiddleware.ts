import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../utils/logger';

export interface AuditableDocument extends Document {
  _auditHistory?: any[];
  toAuditableObject?(): any;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

export interface AuditEntry {
  timestamp: Date;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  changes: AuditChange[];
  metadata?: Record<string, any>;
}

/**
 * Audit middleware for Mongoose schemas
 * Tracks all changes to documents with detailed change history
 */
export function auditMiddleware(schema: Schema) {
  // Add audit history field to schema
  schema.add({
    _auditHistory: [{
      timestamp: { type: Date, default: Date.now },
      action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'], required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sessionId: String,
      ipAddress: String,
      userAgent: String,
      changes: [{
        field: { type: String, required: true },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changeType: { type: String, enum: ['create', 'update', 'delete'], required: true }
      }],
      metadata: Schema.Types.Mixed
    }]
  });

  // Pre-save middleware to capture changes
  schema.pre('save', async function(next) {
    const doc = this as AuditableDocument;
    const changes: AuditChange[] = [];
    let action: 'CREATE' | 'UPDATE' = 'CREATE';

    if (!doc.isNew) {
      action = 'UPDATE';

      // Get modified paths
      const modifiedPaths = doc.modifiedPaths();

      for (const path of modifiedPaths) {
        // Skip audit history field itself
        if (path === '_auditHistory') continue;

        const oldValue = (doc as any).$__original?.[path] || doc.get(path, null, { getters: false });
        const newValue = doc.get(path);

        // Skip if values are the same
        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

        changes.push({
          field: path,
          oldValue: sanitizeValue(oldValue),
          newValue: sanitizeValue(newValue),
          changeType: 'update'
        });
      }
    } else {
      // For new documents, capture all fields
      const obj = doc.toObject();
      for (const [field, value] of Object.entries(obj)) {
        if (field === '_id' || field === '__v' || field === '_auditHistory') continue;

        changes.push({
          field,
          oldValue: null,
          newValue: sanitizeValue(value),
          changeType: 'create'
        });
      }
    }

    // Add audit entry if there are changes
    if (changes.length > 0) {
      const auditEntry: AuditEntry = {
        timestamp: new Date(),
        action,
        changes,
        // These will be populated from request context if available
        userId: (doc as any)._auditUserId,
        sessionId: (doc as any)._auditSessionId,
        ipAddress: (doc as any)._auditIpAddress,
        userAgent: (doc as any)._auditUserAgent,
        metadata: (doc as any)._auditMetadata
      };

      if (!doc._auditHistory) {
        doc._auditHistory = [];
      }

      doc._auditHistory.push(auditEntry);

      // Limit audit history to last 100 entries to prevent unbounded growth
      if (doc._auditHistory.length > 100) {
        doc._auditHistory = doc._auditHistory.slice(-100);
      }
    }

    next();
  });

  // Pre-remove middleware
  schema.pre('remove', async function(next) {
    const doc = this as AuditableDocument;

    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      action: 'DELETE',
      changes: [{
        field: '_document',
        oldValue: sanitizeValue(doc.toObject()),
        newValue: null,
        changeType: 'delete'
      }],
      userId: (doc as any)._auditUserId,
      sessionId: (doc as any)._auditSessionId,
      ipAddress: (doc as any)._auditIpAddress,
      userAgent: (doc as any)._auditUserAgent,
      metadata: (doc as any)._auditMetadata
    };

    if (!doc._auditHistory) {
      doc._auditHistory = [];
    }

    doc._auditHistory.push(auditEntry);
    await doc.save();

    next();
  });

  // Post-save middleware for logging
  schema.post('save', function(doc: AuditableDocument) {
    if (doc._auditHistory && doc._auditHistory.length > 0) {
      const latestEntry = doc._auditHistory[doc._auditHistory.length - 1];
      logger.info(`Audit: ${latestEntry.action} on ${doc.constructor.modelName} ${doc._id}`, {
        userId: latestEntry.userId,
        changesCount: latestEntry.changes.length,
        timestamp: latestEntry.timestamp
      });
    }
  });

  // Instance method to get audit history
  schema.methods.getAuditHistory = function(limit?: number): AuditEntry[] {
    const history = this._auditHistory || [];
    if (limit && limit > 0) {
      return history.slice(-limit);
    }
    return history;
  };

  // Instance method to get latest audit entry
  schema.methods.getLatestAuditEntry = function(): AuditEntry | null {
    const history = this._auditHistory || [];
    return history.length > 0 ? history[history.length - 1] : null;
  };

  // Instance method to set audit context
  schema.methods.setAuditContext = function(context: {
    userId?: string | mongoose.Types.ObjectId;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    if (context.userId) {
      (this as any)._auditUserId = typeof context.userId === 'string'
        ? new mongoose.Types.ObjectId(context.userId)
        : context.userId;
    }
    if (context.sessionId) (this as any)._auditSessionId = context.sessionId;
    if (context.ipAddress) (this as any)._auditIpAddress = context.ipAddress;
    if (context.userAgent) (this as any)._auditUserAgent = context.userAgent;
    if (context.metadata) (this as any)._auditMetadata = context.metadata;

    return this;
  };

  // Static method to find documents by audit criteria
  schema.statics.findByAuditCriteria = function(criteria: {
    userId?: string | mongoose.Types.ObjectId;
    action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
    dateRange?: { start: Date; end: Date };
    field?: string;
  }) {
    const query: any = {};

    if (criteria.userId) {
      query['_auditHistory.userId'] = typeof criteria.userId === 'string'
        ? new mongoose.Types.ObjectId(criteria.userId)
        : criteria.userId;
    }

    if (criteria.action) {
      query['_auditHistory.action'] = criteria.action;
    }

    if (criteria.dateRange) {
      query['_auditHistory.timestamp'] = {
        $gte: criteria.dateRange.start,
        $lte: criteria.dateRange.end
      };
    }

    if (criteria.field) {
      query['_auditHistory.changes.field'] = criteria.field;
    }

    return this.find(query);
  };

  // Static method to get audit statistics
  schema.statics.getAuditStats = async function(dateRange?: { start: Date; end: Date }) {
    const matchStage: any = {};

    if (dateRange) {
      matchStage['_auditHistory.timestamp'] = {
        $gte: dateRange.start,
        $lte: dateRange.end
      };
    }

    try {
      const stats = await this.aggregate([
        { $match: matchStage },
        { $unwind: '$_auditHistory' },
        {
          $group: {
            _id: null,
            totalChanges: { $sum: 1 },
            byAction: {
              $push: {
                action: '$_auditHistory.action',
                count: 1
              }
            },
            byUser: {
              $push: {
                userId: '$_auditHistory.userId',
                count: 1
              }
            },
            firstChange: { $min: '$_auditHistory.timestamp' },
            lastChange: { $max: '$_auditHistory.timestamp' }
          }
        }
      ]);

      return stats[0] || {
        totalChanges: 0,
        byAction: [],
        byUser: [],
        firstChange: null,
        lastChange: null
      };
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      return null;
    }
  };
}

/**
 * Sanitize values for audit logging
 * Removes sensitive data and converts to JSON-safe format
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle ObjectIds
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  // Handle Dates
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  // Handle objects
  if (typeof value === 'object') {
    const sanitized: any = {};

    for (const [key, val] of Object.entries(value)) {
      // Skip sensitive fields
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(val);
      }
    }

    return sanitized;
  }

  return value;
}

/**
 * Check if a field contains sensitive data
 */
function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'credential',
    'ssn',
    'social',
    'credit',
    'card',
    'account'
  ];

  const lowerFieldName = fieldName.toLowerCase();
  return sensitiveFields.some(sensitive => lowerFieldName.includes(sensitive));
}

/**
 * Express middleware to set audit context from request
 */
export function setAuditContext(req: any, res: any, next: any) {
  // Store audit context in request for use in document operations
  req.auditContext = {
    userId: req.userId || req.user?.id,
    sessionId: req.sessionID || req.headers['x-session-id'],
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    metadata: {
      method: req.method,
      url: req.url,
      timestamp: new Date()
    }
  };

  next();
}

export default auditMiddleware;