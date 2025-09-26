import mongoose, { Document, Schema } from 'mongoose';
import { auditMiddleware } from '../middleware/auditMiddleware';

// Enums matching frontend types
export const ContentTypes = [
  'social-post', 'blog-article', 'email-campaign', 'video-script',
  'advertisement', 'press-release', 'newsletter', 'landing-page',
  'product-description', 'marketing-copy'
] as const;

export const ApprovalStatuses = [
  'draft', 'pending', 'in-review', 'revision-requested',
  'approved', 'rejected', 'published', 'scheduled'
] as const;

export const Priorities = ['low', 'medium', 'high', 'urgent'] as const;

export const PlatformTypes = [
  'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok',
  'youtube', 'website', 'email', 'print', 'other'
] as const;

export const CommentTypes = ['general', 'approval', 'revision', 'question'] as const;
export const CommentStatuses = ['active', 'resolved', 'archived'] as const;

// Sub-schemas
const ContentVersionSchema = new Schema({
  versionNumber: { type: Number, required: true },
  content: {
    title: String,
    body: { type: String, required: true },
    caption: String,
    hashtags: [String],
    callToAction: String,
    mediaUrls: [String],
    scheduledDate: Date
  },
  changes: [String],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String,
  aiGenerated: { type: Boolean, default: false },
  aiModel: String,
  aiPrompt: String
});

const ApprovalCommentSchema = new Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalComment' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: CommentTypes, default: 'general' },
  status: { type: String, enum: CommentStatuses, default: 'active' },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attachments: [String],
  isPinned: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  editedAt: Date,
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
});

const ApprovalActionSchema = new Schema({
  actionType: {
    type: String,
    enum: ['status_change', 'comment', 'version_update', 'reminder_sent', 'link_generated', 'approval', 'rejection'],
    required: true
  },
  fromStatus: { type: String, enum: ApprovalStatuses },
  toStatus: { type: String, enum: ApprovalStatuses },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedAt: { type: Date, default: Date.now },
  details: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String
});

const ClientReviewLinkSchema = new Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true, index: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true, index: true },
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: Date,
  createdAt: { type: Date, default: Date.now },
  settings: {
    allowComments: { type: Boolean, default: true },
    allowDownload: { type: Boolean, default: false },
    requirePassword: { type: Boolean, default: false },
    password: String,
    notifyOnAccess: { type: Boolean, default: true },
    showAnalytics: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false }
  }
});

// Main ContentItem schema
const ContentItemSchema = new Schema({
  // Basic info
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  contentType: { type: String, enum: ContentTypes, required: true, index: true },
  platform: { type: String, enum: PlatformTypes, required: true, index: true },
  status: { type: String, enum: ApprovalStatuses, default: 'draft', index: true },
  priority: { type: String, enum: Priorities, default: 'medium', index: true },

  // Content versions
  versions: [ContentVersionSchema],
  currentVersionId: { type: mongoose.Schema.Types.ObjectId, required: true },

  // Approval workflow
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalWorkflow' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  currentStage: { type: Number, default: 0 },
  stageHistory: [{
    stage: Number,
    enteredAt: { type: Date, default: Date.now },
    exitedAt: Date,
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['approved', 'rejected', 'revision_requested'] }
  }],

  // Scheduling
  dueDate: { type: Date, index: true },
  scheduledPublishDate: Date,
  publishedAt: Date,

  // Metadata
  tags: { type: [String], index: true },
  brand: String,
  targetAudience: String,
  objectives: [String],
  businessValue: {
    expectedReach: Number,
    expectedEngagement: Number,
    estimatedRevenue: Number
  },

  // Tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now, index: true },

  // Comments and feedback
  comments: [ApprovalCommentSchema],
  totalComments: { type: Number, default: 0 },
  unresolvedComments: { type: Number, default: 0 },

  // Review links
  reviewLinks: [ClientReviewLinkSchema],

  // Actions history
  actions: [ApprovalActionSchema],

  // Reminders
  remindersSent: { type: Number, default: 0 },
  lastReminderAt: Date,
  nextReminderAt: Date,

  // AI and Performance
  aiSuggestions: [{
    type: { type: String, enum: ['optimization', 'engagement', 'compliance', 'seo'] },
    suggestion: String,
    confidence: Number,
    appliedAt: Date,
    result: String
  }],
  performanceMetrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastUpdated: Date
  },

  // Compliance and Legal
  complianceChecks: [{
    type: { type: String, enum: ['legal', 'brand', 'platform', 'accessibility'] },
    status: { type: String, enum: ['pass', 'fail', 'warning'], default: 'pass' },
    details: String,
    checkedAt: { type: Date, default: Date.now },
    checkedBy: { type: String, enum: ['system', 'user'] }
  }],

  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
ContentItemSchema.index({ clientId: 1, status: 1, createdAt: -1 });
ContentItemSchema.index({ clientId: 1, dueDate: 1 });
ContentItemSchema.index({ assignedTo: 1, status: 1 });
ContentItemSchema.index({ status: 1, dueDate: 1 });
ContentItemSchema.index({ contentType: 1, platform: 1 });
ContentItemSchema.index({ tags: 1 });
ContentItemSchema.index({ 'reviewLinks.token': 1 });
ContentItemSchema.index({ lastActivityAt: -1 });
ContentItemSchema.index({ isDeleted: 1, deletedAt: 1 });

// Text search index
ContentItemSchema.index({
  title: 'text',
  description: 'text',
  'versions.content.body': 'text',
  tags: 'text'
});

// Middleware
ContentItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActivityAt = new Date();

  // Update comment counts
  this.totalComments = this.comments.length;
  this.unresolvedComments = this.comments.filter(c => c.status === 'active').length;

  next();
});

// Soft delete middleware
ContentItemSchema.pre(/^find/, function() {
  // Don't return deleted items by default
  this.where({ isDeleted: { $ne: true } });
});

// Apply audit middleware
ContentItemSchema.plugin(auditMiddleware);

// Instance methods
ContentItemSchema.methods.getCurrentVersion = function() {
  return this.versions.find(v => v._id.toString() === this.currentVersionId.toString());
};

ContentItemSchema.methods.addComment = function(commentData: any) {
  const comment = {
    ...commentData,
    createdAt: new Date()
  };
  this.comments.push(comment);
  this.lastActivityAt = new Date();
  return this.save();
};

ContentItemSchema.methods.addAction = function(actionData: any) {
  const action = {
    ...actionData,
    performedAt: new Date()
  };
  this.actions.push(action);
  this.lastActivityAt = new Date();
  return this.save();
};

ContentItemSchema.methods.softDelete = function(userId: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.lastActivityAt = new Date();
  return this.save();
};

ContentItemSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.lastActivityAt = new Date();
  return this.save();
};

// Static methods
ContentItemSchema.statics.findWithDeleted = function() {
  return this.findWithDeleted();
};

ContentItemSchema.statics.findDeleted = function() {
  return this.where({ isDeleted: true });
};

ContentItemSchema.statics.getApprovalStats = async function(clientId?: string) {
  const match: any = {};
  if (clientId) match.clientId = new mongoose.Types.ObjectId(clientId);

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalContent: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        byContentType: {
          $push: {
            contentType: '$contentType',
            count: 1
          }
        },
        overdueItems: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'approved'] },
                  { $ne: ['$status', 'published'] }
                ]
              },
              1,
              0
            ]
          }
        },
        pendingApprovals: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'in-review']] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalContent: 0,
    byStatus: [],
    byContentType: [],
    overdueItems: 0,
    pendingApprovals: 0
  };
};

export interface IContentItem extends Document {
  clientId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  contentType: typeof ContentTypes[number];
  platform: typeof PlatformTypes[number];
  status: typeof ApprovalStatuses[number];
  priority: typeof Priorities[number];
  versions: any[];
  currentVersionId: mongoose.Types.ObjectId;
  workflowId?: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  approvedBy: mongoose.Types.ObjectId[];
  rejectedBy?: mongoose.Types.ObjectId[];
  currentStage: number;
  stageHistory: any[];
  dueDate?: Date;
  scheduledPublishDate?: Date;
  publishedAt?: Date;
  tags: string[];
  brand?: string;
  targetAudience?: string;
  objectives?: string[];
  businessValue?: any;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  comments: any[];
  totalComments: number;
  unresolvedComments: number;
  reviewLinks: any[];
  actions: any[];
  remindersSent: number;
  lastReminderAt?: Date;
  nextReminderAt?: Date;
  aiSuggestions: any[];
  performanceMetrics: any;
  complianceChecks: any[];
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;

  // Instance methods
  getCurrentVersion(): any;
  addComment(commentData: any): Promise<IContentItem>;
  addAction(actionData: any): Promise<IContentItem>;
  softDelete(userId: string): Promise<IContentItem>;
  restore(): Promise<IContentItem>;
}

export const ContentItem = mongoose.model<IContentItem>('ContentItem', ContentItemSchema);
export default ContentItem;