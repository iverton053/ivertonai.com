import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MERGE' | 'RESTORE';
  resourceType: 'Contact' | 'Deal' | 'Pipeline' | 'Activity' | 'User';
  resourceId: mongoose.Types.ObjectId;

  // Change details
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    operation: 'ADD' | 'REMOVE' | 'MODIFY';
  }>;

  // Request context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;

  // Additional metadata
  metadata: {
    source: 'web' | 'api' | 'import' | 'automation' | 'sync';
    reason?: string;
    batch?: boolean;
    batchId?: string;
  };

  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'MERGE', 'RESTORE']
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['Contact', 'Deal', 'Pipeline', 'Activity', 'User']
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true
  },

  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    operation: {
      type: String,
      enum: ['ADD', 'REMOVE', 'MODIFY'],
      required: true
    }
  }],

  ipAddress: String,
  userAgent: String,
  sessionId: String,
  requestId: String,

  metadata: {
    source: {
      type: String,
      enum: ['web', 'api', 'import', 'automation', 'sync'],
      required: true,
      default: 'web'
    },
    reason: String,
    batch: {
      type: Boolean,
      default: false
    },
    batchId: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Comprehensive indexes for audit queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, resourceType: 1, createdAt: -1 });
auditLogSchema.index({ 'metadata.source': 1, createdAt: -1 });
auditLogSchema.index({ 'metadata.batchId': 1 }, { sparse: true });
auditLogSchema.index({ sessionId: 1 }, { sparse: true });
auditLogSchema.index({ createdAt: -1 }); // For cleanup operations

// TTL index for automatic cleanup of old audit logs (2 years)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);