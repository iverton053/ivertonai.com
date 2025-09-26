import mongoose, { Document, Schema } from 'mongoose';

export interface IIntegration extends Document {
  id: string;
  name: string;
  type: 'social_media' | 'cloud_storage' | 'analytics' | 'communication' | 'design_tool' | 'automation' | 'crm' | 'email_marketing' | 'custom';
  platform: string; // e.g., 'facebook', 'google_drive', 'slack', etc.
  status: 'active' | 'inactive' | 'error' | 'pending_auth' | 'expired';

  // Authentication & Configuration
  auth: {
    type: 'oauth2' | 'api_key' | 'webhook' | 'basic_auth' | 'custom';
    credentials: {
      access_token?: string;
      refresh_token?: string;
      api_key?: string;
      api_secret?: string;
      client_id?: string;
      client_secret?: string;
      username?: string;
      password?: string;
      webhook_url?: string;
      custom_fields?: Record<string, string>;
    };
    token_expires_at?: Date;
    scopes?: string[];
    auth_url?: string;
    redirect_uri?: string;
  };

  // Connection Configuration
  config: {
    endpoints?: {
      base_url: string;
      auth_url?: string;
      api_version?: string;
      rate_limit?: {
        requests_per_minute: number;
        requests_per_hour: number;
        requests_per_day: number;
      };
    };
    features: {
      publish_content?: boolean;
      schedule_content?: boolean;
      fetch_analytics?: boolean;
      manage_comments?: boolean;
      upload_media?: boolean;
      create_campaigns?: boolean;
      sync_data?: boolean;
      webhook_support?: boolean;
    };
    settings?: {
      auto_publish?: boolean;
      default_visibility?: string;
      content_format?: string;
      image_quality?: 'low' | 'medium' | 'high';
      video_quality?: 'low' | 'medium' | 'high';
      custom_settings?: Record<string, any>;
    };
  };

  // Usage Statistics
  usage: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    last_request_at?: Date;
    last_success_at?: Date;
    last_error_at?: Date;
    rate_limit_hits: number;
    data_synced?: {
      posts_published: number;
      media_uploaded: number;
      analytics_fetched: number;
      comments_managed: number;
    };
  };

  // Health & Monitoring
  health: {
    status: 'healthy' | 'warning' | 'error';
    last_health_check?: Date;
    response_time_ms?: number;
    error_rate_percentage?: number;
    uptime_percentage?: number;
    consecutive_failures: number;
  };

  // Webhook Configuration
  webhooks?: Array<{
    id: string;
    event: string;
    url: string;
    secret?: string;
    active: boolean;
    created_at: Date;
  }>;

  // Error Handling
  errors: Array<{
    timestamp: Date;
    type: 'auth_error' | 'rate_limit' | 'api_error' | 'network_error' | 'validation_error';
    message: string;
    details?: any;
    resolved: boolean;
  }>;

  // Access Control
  created_by: string; // User ID
  team_id?: string;
  shared_with: string[]; // User IDs who can use this integration
  permissions: {
    can_read: string[];
    can_write: string[];
    can_delete: string[];
    can_configure: string[];
  };

  // Sync & Scheduling
  sync_settings?: {
    enabled: boolean;
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    last_sync_at?: Date;
    next_sync_at?: Date;
    sync_direction: 'pull' | 'push' | 'bidirectional';
    auto_retry: boolean;
    retry_attempts: number;
  };

  created_at: Date;
  updated_at: Date;
}

const IntegrationSchema = new Schema<IIntegration>({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  type: {
    type: String,
    enum: ['social_media', 'cloud_storage', 'analytics', 'communication', 'design_tool', 'automation', 'crm', 'email_marketing', 'custom'],
    required: true,
    index: true
  },
  platform: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'pending_auth', 'expired'],
    default: 'pending_auth',
    index: true
  },

  auth: {
    type: {
      type: String,
      enum: ['oauth2', 'api_key', 'webhook', 'basic_auth', 'custom'],
      required: true
    },
    credentials: {
      access_token: String,
      refresh_token: String,
      api_key: String,
      api_secret: String,
      client_id: String,
      client_secret: String,
      username: String,
      password: String,
      webhook_url: String,
      custom_fields: Schema.Types.Mixed
    },
    token_expires_at: Date,
    scopes: [String],
    auth_url: String,
    redirect_uri: String
  },

  config: {
    endpoints: {
      base_url: String,
      auth_url: String,
      api_version: String,
      rate_limit: {
        requests_per_minute: Number,
        requests_per_hour: Number,
        requests_per_day: Number
      }
    },
    features: {
      publish_content: { type: Boolean, default: false },
      schedule_content: { type: Boolean, default: false },
      fetch_analytics: { type: Boolean, default: false },
      manage_comments: { type: Boolean, default: false },
      upload_media: { type: Boolean, default: false },
      create_campaigns: { type: Boolean, default: false },
      sync_data: { type: Boolean, default: false },
      webhook_support: { type: Boolean, default: false }
    },
    settings: {
      auto_publish: { type: Boolean, default: false },
      default_visibility: String,
      content_format: String,
      image_quality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'high'
      },
      video_quality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      custom_settings: Schema.Types.Mixed
    }
  },

  usage: {
    total_requests: { type: Number, default: 0 },
    successful_requests: { type: Number, default: 0 },
    failed_requests: { type: Number, default: 0 },
    last_request_at: Date,
    last_success_at: Date,
    last_error_at: Date,
    rate_limit_hits: { type: Number, default: 0 },
    data_synced: {
      posts_published: { type: Number, default: 0 },
      media_uploaded: { type: Number, default: 0 },
      analytics_fetched: { type: Number, default: 0 },
      comments_managed: { type: Number, default: 0 }
    }
  },

  health: {
    status: {
      type: String,
      enum: ['healthy', 'warning', 'error'],
      default: 'healthy'
    },
    last_health_check: Date,
    response_time_ms: Number,
    error_rate_percentage: Number,
    uptime_percentage: Number,
    consecutive_failures: { type: Number, default: 0 }
  },

  webhooks: [{
    id: String,
    event: String,
    url: String,
    secret: String,
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
  }],

  errors: [{
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['auth_error', 'rate_limit', 'api_error', 'network_error', 'validation_error']
    },
    message: String,
    details: Schema.Types.Mixed,
    resolved: { type: Boolean, default: false }
  }],

  created_by: {
    type: String,
    required: true,
    index: true
  },
  team_id: {
    type: String,
    index: true
  },
  shared_with: [String],
  permissions: {
    can_read: [String],
    can_write: [String],
    can_delete: [String],
    can_configure: [String]
  },

  sync_settings: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['real_time', 'hourly', 'daily', 'weekly'],
      default: 'daily'
    },
    last_sync_at: Date,
    next_sync_at: Date,
    sync_direction: {
      type: String,
      enum: ['pull', 'push', 'bidirectional'],
      default: 'bidirectional'
    },
    auto_retry: { type: Boolean, default: true },
    retry_attempts: { type: Number, default: 3 }
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
IntegrationSchema.index({ created_by: 1, status: 1 });
IntegrationSchema.index({ type: 1, platform: 1 });
IntegrationSchema.index({ team_id: 1, status: 1 });
IntegrationSchema.index({ 'auth.token_expires_at': 1 }, { sparse: true });
IntegrationSchema.index({ 'sync_settings.next_sync_at': 1 }, { sparse: true });

// Static methods
IntegrationSchema.statics.findByUser = function(
  userId: string,
  options: {
    type?: string;
    platform?: string;
    status?: string;
    teamId?: string;
  } = {}
) {
  const query: any = {
    $or: [
      { created_by: userId },
      { shared_with: userId },
      { 'permissions.can_read': userId }
    ]
  };

  if (options.type) query.type = options.type;
  if (options.platform) query.platform = options.platform;
  if (options.status) query.status = options.status;
  if (options.teamId) query.team_id = options.teamId;

  return this.find(query)
    .sort({ created_at: -1 })
    .populate('created_by', 'name email')
    .lean();
};

IntegrationSchema.statics.findExpiredTokens = function() {
  const now = new Date();
  return this.find({
    'auth.token_expires_at': { $lt: now },
    status: 'active'
  });
};

IntegrationSchema.statics.findScheduledSyncs = function() {
  const now = new Date();
  return this.find({
    'sync_settings.enabled': true,
    'sync_settings.next_sync_at': { $lte: now },
    status: 'active'
  });
};

IntegrationSchema.statics.getUsageStats = function(userId?: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchStage: any = { created_at: { $gte: startDate } };
  if (userId) {
    matchStage.$or = [
      { created_by: userId },
      { shared_with: userId }
    ];
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalRequests: { $sum: '$usage.total_requests' },
        successfulRequests: { $sum: '$usage.successful_requests' },
        failedRequests: { $sum: '$usage.failed_requests' },
        avgResponseTime: { $avg: '$health.response_time_ms' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
IntegrationSchema.methods.canAccess = function(userId: string, action: 'read' | 'write' | 'delete' | 'configure' = 'read') {
  // Owner has full access
  if (this.created_by === userId) return true;

  // Check specific permissions
  if (this.permissions[`can_${action}`]?.includes(userId)) return true;

  // Check shared access (read only)
  if (action === 'read' && this.shared_with.includes(userId)) return true;

  return false;
};

IntegrationSchema.methods.updateStatus = function(status: 'active' | 'inactive' | 'error' | 'pending_auth' | 'expired') {
  this.status = status;

  if (status === 'error') {
    this.health.status = 'error';
    this.health.consecutive_failures += 1;
  } else if (status === 'active') {
    this.health.status = 'healthy';
    this.health.consecutive_failures = 0;
  }

  return this.save();
};

IntegrationSchema.methods.logRequest = function(success: boolean, responseTime?: number, error?: any) {
  this.usage.total_requests += 1;
  this.usage.last_request_at = new Date();

  if (success) {
    this.usage.successful_requests += 1;
    this.usage.last_success_at = new Date();
    if (responseTime) {
      this.health.response_time_ms = responseTime;
    }
  } else {
    this.usage.failed_requests += 1;
    this.usage.last_error_at = new Date();
    this.health.consecutive_failures += 1;

    // Log error
    if (error) {
      this.errors.push({
        timestamp: new Date(),
        type: error.type || 'api_error',
        message: error.message || 'Unknown error',
        details: error.details,
        resolved: false
      });

      // Keep only last 50 errors
      if (this.errors.length > 50) {
        this.errors = this.errors.slice(-50);
      }
    }
  }

  // Update error rate
  if (this.usage.total_requests > 0) {
    this.health.error_rate_percentage = (this.usage.failed_requests / this.usage.total_requests) * 100;
  }

  // Update health status
  if (this.health.consecutive_failures >= 5) {
    this.health.status = 'error';
  } else if (this.health.error_rate_percentage! > 25) {
    this.health.status = 'warning';
  } else {
    this.health.status = 'healthy';
  }

  return this.save();
};

IntegrationSchema.methods.refreshToken = function(newToken: string, expiresAt?: Date) {
  this.auth.credentials.access_token = newToken;
  if (expiresAt) {
    this.auth.token_expires_at = expiresAt;
  }
  this.status = 'active';
  return this.save();
};

IntegrationSchema.methods.scheduleSync = function() {
  if (!this.sync_settings?.enabled) return;

  const now = new Date();
  let nextSync = new Date(now);

  switch (this.sync_settings.frequency) {
    case 'hourly':
      nextSync.setHours(nextSync.getHours() + 1);
      break;
    case 'daily':
      nextSync.setDate(nextSync.getDate() + 1);
      break;
    case 'weekly':
      nextSync.setDate(nextSync.getDate() + 7);
      break;
  }

  this.sync_settings.next_sync_at = nextSync;
  return this.save();
};

IntegrationSchema.methods.addWebhook = function(event: string, url: string, secret?: string) {
  if (!this.webhooks) this.webhooks = [];

  const webhook = {
    id: new mongoose.Types.ObjectId().toString(),
    event,
    url,
    secret,
    active: true,
    created_at: new Date()
  };

  this.webhooks.push(webhook);
  return this.save();
};

IntegrationSchema.methods.removeWebhook = function(webhookId: string) {
  if (this.webhooks) {
    this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
  }
  return this.save();
};

IntegrationSchema.methods.isTokenExpired = function() {
  return this.auth.token_expires_at && new Date() > this.auth.token_expires_at;
};

IntegrationSchema.methods.checkHealth = function() {
  this.health.last_health_check = new Date();

  // Calculate uptime percentage (simplified)
  if (this.usage.total_requests > 0) {
    this.health.uptime_percentage = (this.usage.successful_requests / this.usage.total_requests) * 100;
  }

  return this.save();
};

// Middleware
IntegrationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Initialize permissions
    if (!this.permissions) {
      this.permissions = {
        can_read: [this.created_by],
        can_write: [this.created_by],
        can_delete: [this.created_by],
        can_configure: [this.created_by]
      };
    }

    // Schedule initial sync if enabled
    if (this.sync_settings?.enabled && !this.sync_settings.next_sync_at) {
      this.scheduleSync();
    }
  }

  // Check token expiration
  if (this.isModified('auth.token_expires_at') && this.isTokenExpired()) {
    this.status = 'expired';
  }

  next();
});

export default mongoose.model<IIntegration>('Integration', IntegrationSchema);