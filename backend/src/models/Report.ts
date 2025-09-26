import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  id: string;
  name: string;
  description?: string;
  type: 'analytics' | 'performance' | 'approval_summary' | 'user_activity' | 'content_metrics' | 'workflow_efficiency' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'scheduled';

  // Report Configuration
  config: {
    date_range: {
      start_date: Date;
      end_date: Date;
      preset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'custom';
    };
    filters: {
      content_types?: string[];
      platforms?: string[];
      statuses?: string[];
      priorities?: string[];
      assignees?: string[];
      campaigns?: string[];
      workflows?: string[];
      teams?: string[];
    };
    metrics: string[];
    groupBy?: string[];
    sortBy?: { field: string; direction: 'asc' | 'desc'; };
    includeCharts?: boolean;
    includeTables?: boolean;
    includeRawData?: boolean;
  };

  // Scheduling
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    day_of_week?: number; // 0-6 for weekly
    day_of_month?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
    next_run?: Date;
    recipients: string[]; // User IDs
    delivery_method: 'email' | 'download' | 'both';
  };

  // Generation Details
  generated_by: string; // User ID
  generated_at?: Date;
  generation_time_ms?: number;
  file_path?: string;
  file_size?: number;
  download_url?: string;
  expires_at?: Date;

  // Data and Results
  data?: any;
  summary?: {
    total_records: number;
    key_metrics: Record<string, any>;
    insights: string[];
    recommendations?: string[];
  };

  // Error Handling
  error_message?: string;
  retry_count: number;
  last_retry_at?: Date;

  // Access Control
  visibility: 'private' | 'team' | 'organization';
  shared_with: string[]; // User IDs
  access_permissions: {
    can_view: string[];
    can_edit: string[];
    can_delete: string[];
  };

  created_at: Date;
  updated_at: Date;
}

const ReportSchema = new Schema<IReport>({
  name: {
    type: String,
    required: true,
    maxlength: 200,
    index: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['analytics', 'performance', 'approval_summary', 'user_activity', 'content_metrics', 'workflow_efficiency', 'custom'],
    required: true,
    index: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed', 'scheduled'],
    default: 'pending',
    index: true
  },

  config: {
    date_range: {
      start_date: { type: Date, required: true },
      end_date: { type: Date, required: true },
      preset: {
        type: String,
        enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'custom']
      }
    },
    filters: {
      content_types: [String],
      platforms: [String],
      statuses: [String],
      priorities: [String],
      assignees: [String],
      campaigns: [String],
      workflows: [String],
      teams: [String]
    },
    metrics: {
      type: [String],
      required: true
    },
    groupBy: [String],
    sortBy: {
      field: String,
      direction: {
        type: String,
        enum: ['asc', 'desc']
      }
    },
    includeCharts: { type: Boolean, default: true },
    includeTables: { type: Boolean, default: true },
    includeRawData: { type: Boolean, default: false }
  },

  schedule: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly']
    },
    day_of_week: {
      type: Number,
      min: 0,
      max: 6
    },
    day_of_month: {
      type: Number,
      min: 1,
      max: 31
    },
    time: String,
    timezone: { type: String, default: 'UTC' },
    next_run: Date,
    recipients: [String],
    delivery_method: {
      type: String,
      enum: ['email', 'download', 'both'],
      default: 'download'
    }
  },

  generated_by: {
    type: String,
    required: true,
    index: true
  },
  generated_at: Date,
  generation_time_ms: Number,
  file_path: String,
  file_size: Number,
  download_url: String,
  expires_at: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },

  data: Schema.Types.Mixed,
  summary: {
    total_records: Number,
    key_metrics: Schema.Types.Mixed,
    insights: [String],
    recommendations: [String]
  },

  error_message: String,
  retry_count: { type: Number, default: 0 },
  last_retry_at: Date,

  visibility: {
    type: String,
    enum: ['private', 'team', 'organization'],
    default: 'private',
    index: true
  },
  shared_with: [String],
  access_permissions: {
    can_view: [String],
    can_edit: [String],
    can_delete: [String]
  },

  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ReportSchema.index({ generated_by: 1, created_at: -1 });
ReportSchema.index({ type: 1, status: 1 });
ReportSchema.index({ 'schedule.enabled': 1, 'schedule.next_run': 1 });
ReportSchema.index({ expires_at: 1 }, { sparse: true });
ReportSchema.index({ status: 1, created_at: -1 });

// Static methods
ReportSchema.statics.findByUser = function(
  userId: string,
  options: {
    type?: string;
    status?: string;
    visibility?: string;
    limit?: number;
    skip?: number;
  } = {}
) {
  const query: any = {
    $or: [
      { generated_by: userId },
      { shared_with: userId },
      { 'access_permissions.can_view': userId },
      { visibility: 'organization' }
    ]
  };

  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;
  if (options.visibility) query.visibility = options.visibility;

  return this.find(query)
    .sort({ created_at: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .populate('generated_by', 'name email')
    .lean();
};

ReportSchema.statics.findScheduledReports = function() {
  const now = new Date();
  return this.find({
    'schedule.enabled': true,
    'schedule.next_run': { $lte: now },
    status: { $ne: 'generating' }
  }).lean();
};

ReportSchema.statics.getReportStats = function(userId?: string) {
  const matchStage: any = {};
  if (userId) {
    matchStage.$or = [
      { generated_by: userId },
      { shared_with: userId },
      { 'access_permissions.can_view': userId }
    ];
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        completedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        scheduledReports: {
          $sum: { $cond: [{ $eq: ['$schedule.enabled', true] }, 1, 0] }
        },
        avgGenerationTime: { $avg: '$generation_time_ms' },
        totalFileSize: { $sum: '$file_size' }
      }
    }
  ]);
};

ReportSchema.statics.deleteExpiredReports = function() {
  const now = new Date();
  return this.deleteMany({
    expires_at: { $lt: now }
  });
};

ReportSchema.statics.findDuplicateReports = function(
  userId: string,
  name: string,
  type: string,
  timeWindow: number = 3600000 // 1 hour in ms
) {
  const cutoff = new Date(Date.now() - timeWindow);

  return this.find({
    generated_by: userId,
    name: name,
    type: type,
    created_at: { $gte: cutoff },
    status: { $in: ['completed', 'generating'] }
  });
};

// Instance methods
ReportSchema.methods.canAccess = function(userId: string, action: 'view' | 'edit' | 'delete' = 'view') {
  // Owner has full access
  if (this.generated_by === userId) return true;

  // Check specific permissions
  if (this.access_permissions[`can_${action}`]?.includes(userId)) return true;

  // Check shared access (view only)
  if (action === 'view' && this.shared_with.includes(userId)) return true;

  // Check organization visibility (view only)
  if (action === 'view' && this.visibility === 'organization') return true;

  return false;
};

ReportSchema.methods.updateStatus = function(
  status: 'pending' | 'generating' | 'completed' | 'failed',
  additionalData?: any
) {
  this.status = status;

  if (status === 'generating') {
    this.generated_at = new Date();
  }

  if (status === 'completed' && additionalData) {
    this.generation_time_ms = additionalData.generation_time_ms;
    this.file_path = additionalData.file_path;
    this.file_size = additionalData.file_size;
    this.download_url = additionalData.download_url;
    this.data = additionalData.data;
    this.summary = additionalData.summary;

    // Set expiration (30 days from generation)
    this.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  if (status === 'failed' && additionalData?.error_message) {
    this.error_message = additionalData.error_message;
    this.retry_count += 1;
    this.last_retry_at = new Date();
  }

  return this.save();
};

ReportSchema.methods.scheduleNext = function() {
  if (!this.schedule?.enabled) return;

  const now = new Date();
  let nextRun = new Date(now);

  switch (this.schedule.frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      const daysUntilTarget = (this.schedule.day_of_week! - now.getDay() + 7) % 7;
      nextRun.setDate(nextRun.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(this.schedule.day_of_month || 1);
      break;
    case 'quarterly':
      nextRun.setMonth(nextRun.getMonth() + 3);
      nextRun.setDate(this.schedule.day_of_month || 1);
      break;
  }

  // Set time
  if (this.schedule.time) {
    const [hours, minutes] = this.schedule.time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
  }

  this.schedule.next_run = nextRun;
  return this.save();
};

ReportSchema.methods.share = function(userIds: string[], permissions: { view?: boolean; edit?: boolean; delete?: boolean; } = { view: true }) {
  userIds.forEach(userId => {
    if (!this.shared_with.includes(userId)) {
      this.shared_with.push(userId);
    }

    if (permissions.view && !this.access_permissions.can_view.includes(userId)) {
      this.access_permissions.can_view.push(userId);
    }
    if (permissions.edit && !this.access_permissions.can_edit.includes(userId)) {
      this.access_permissions.can_edit.push(userId);
    }
    if (permissions.delete && !this.access_permissions.can_delete.includes(userId)) {
      this.access_permissions.can_delete.push(userId);
    }
  });

  return this.save();
};

ReportSchema.methods.unshare = function(userId: string) {
  this.shared_with = this.shared_with.filter(id => id !== userId);
  this.access_permissions.can_view = this.access_permissions.can_view.filter(id => id !== userId);
  this.access_permissions.can_edit = this.access_permissions.can_edit.filter(id => id !== userId);
  this.access_permissions.can_delete = this.access_permissions.can_delete.filter(id => id !== userId);

  return this.save();
};

// Middleware
ReportSchema.pre('save', function(next) {
  if (this.isNew) {
    // Initialize access permissions
    if (!this.access_permissions) {
      this.access_permissions = {
        can_view: [this.generated_by],
        can_edit: [this.generated_by],
        can_delete: [this.generated_by]
      };
    }

    // Set default expiration for new reports (30 days)
    if (!this.expires_at) {
      this.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Schedule next run if needed
  if (this.isModified('schedule') && this.schedule?.enabled && !this.schedule.next_run) {
    this.scheduleNext();
  }

  next();
});

export default mongoose.model<IReport>('Report', ReportSchema);