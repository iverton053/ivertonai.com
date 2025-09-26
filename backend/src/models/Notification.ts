import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  id: string;
  type: 'assignment' | 'approval' | 'comment' | 'deadline' | 'mention' | 'workflow' | 'system';
  title: string;
  message: string;
  recipient_id: string;
  sender_id?: string;
  read: boolean;
  urgent: boolean;
  data: {
    content_id?: string;
    user_id?: string;
    workflow_id?: string;
    comment_id?: string;
    campaign_id?: string;
    team_id?: string;
    url?: string;
    action?: string;
    metadata?: Record<string, any>;
  };
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: string;
    url?: string;
  }>;
  delivery_status: {
    email?: 'pending' | 'sent' | 'failed';
    sms?: 'pending' | 'sent' | 'failed';
    push?: 'pending' | 'sent' | 'failed';
    in_app?: 'pending' | 'delivered' | 'read';
  };
  scheduled_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['assignment', 'approval', 'comment', 'deadline', 'mention', 'workflow', 'system'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  recipient_id: {
    type: String,
    required: true,
    index: true
  },
  sender_id: {
    type: String,
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  urgent: {
    type: Boolean,
    default: false,
    index: true
  },
  data: {
    content_id: String,
    user_id: String,
    workflow_id: String,
    comment_id: String,
    campaign_id: String,
    team_id: String,
    url: String,
    action: String,
    metadata: Schema.Types.Mixed
  },
  actions: [{
    id: String,
    label: String,
    type: {
      type: String,
      enum: ['primary', 'secondary', 'danger']
    },
    action: String,
    url: String
  }],
  delivery_status: {
    email: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    },
    sms: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    },
    push: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    },
    in_app: {
      type: String,
      enum: ['pending', 'delivered', 'read'],
      default: 'pending'
    }
  },
  scheduled_at: Date,
  delivered_at: Date,
  read_at: Date,
  expires_at: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for auto-deletion
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
NotificationSchema.index({ recipient_id: 1, created_at: -1 });
NotificationSchema.index({ recipient_id: 1, read: 1, created_at: -1 });
NotificationSchema.index({ type: 1, created_at: -1 });
NotificationSchema.index({ urgent: 1, read: 1, created_at: -1 });
NotificationSchema.index({ 'data.content_id': 1 });
NotificationSchema.index({ expires_at: 1 }, { sparse: true });

// Static methods
NotificationSchema.statics.findUnreadByUser = function(userId: string, limit: number = 50) {
  return this.find({ recipient_id: userId, read: false })
    .sort({ urgent: -1, created_at: -1 })
    .limit(limit)
    .lean();
};

NotificationSchema.statics.markAsRead = function(notificationIds: string[], userId: string) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient_id: userId
    },
    {
      read: true,
      read_at: new Date(),
      'delivery_status.in_app': 'read'
    }
  );
};

NotificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { recipient_id: userId, read: false },
    {
      read: true,
      read_at: new Date(),
      'delivery_status.in_app': 'read'
    }
  );
};

NotificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({ recipient_id: userId, read: false });
};

NotificationSchema.statics.findByUser = function(
  userId: string,
  options: {
    type?: string;
    read?: boolean;
    urgent?: boolean;
    limit?: number;
    skip?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const query: any = { recipient_id: userId };

  if (options.type) query.type = options.type;
  if (typeof options.read === 'boolean') query.read = options.read;
  if (typeof options.urgent === 'boolean') query.urgent = options.urgent;

  if (options.startDate || options.endDate) {
    query.created_at = {};
    if (options.startDate) query.created_at.$gte = options.startDate;
    if (options.endDate) query.created_at.$lte = options.endDate;
  }

  return this.find(query)
    .sort({ urgent: -1, created_at: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .lean();
};

NotificationSchema.statics.deleteOldNotifications = function(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    created_at: { $lt: cutoffDate },
    urgent: { $ne: true }
  });
};

NotificationSchema.statics.getNotificationStats = function(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        recipient_id: userId,
        created_at: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        },
        urgentCount: {
          $sum: { $cond: [{ $eq: ['$urgent', true] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance methods
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.read_at = new Date();
  this.delivery_status.in_app = 'read';
  return this.save();
};

NotificationSchema.methods.updateDeliveryStatus = function(
  channel: 'email' | 'sms' | 'push' | 'in_app',
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read'
) {
  this.delivery_status[channel] = status;
  if (status === 'sent' || status === 'delivered') {
    this.delivered_at = new Date();
  }
  return this.save();
};

NotificationSchema.methods.isExpired = function() {
  return this.expires_at && new Date() > this.expires_at;
};

// Middleware
NotificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.read_at) {
    this.read_at = new Date();
  }
  next();
});

export default mongoose.model<INotification>('Notification', NotificationSchema);