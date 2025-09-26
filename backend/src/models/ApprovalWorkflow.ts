import mongoose, { Document, Schema } from 'mongoose';
import { ApprovalStatuses } from './ContentItem';

const WorkflowStageSchema = new Schema({
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: ApprovalStatuses, required: true },
  approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  isRequired: { type: Boolean, default: true },
  autoAdvance: { type: Boolean, default: false },
  timeLimit: Number, // hours
  order: { type: Number, required: true },
  conditions: [{
    type: { type: String, enum: ['content_type', 'priority', 'client', 'value'] },
    operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'] },
    value: Schema.Types.Mixed
  }],
  notifications: {
    onEntry: { type: Boolean, default: true },
    onDelay: { type: Boolean, default: true },
    onEscalation: { type: Boolean, default: true },
    customMessage: String
  },
  escalation: {
    enabled: { type: Boolean, default: false },
    afterHours: { type: Number, default: 24 },
    escalateTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    escalationType: { type: String, enum: ['parallel', 'replace'], default: 'parallel' }
  }
});

const ApprovalWorkflowSchema = new Schema({
  name: { type: String, required: true, trim: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Workflow stages
  stages: [WorkflowStageSchema],

  // Workflow settings
  settings: {
    requireAllApprovers: { type: Boolean, default: false },
    allowParallelApprovals: { type: Boolean, default: true },
    autoReminders: { type: Boolean, default: true },
    reminderInterval: { type: Number, default: 24 }, // hours
    maxReminders: { type: Number, default: 3 },
    escalationAfter: Number, // hours
    escalateTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Advanced settings
    allowSkipStages: { type: Boolean, default: false },
    allowDelegation: { type: Boolean, default: true },
    requireComments: { type: Boolean, default: false },
    enableVersionControl: { type: Boolean, default: true },
    autoPublish: { type: Boolean, default: false },

    // AI-powered features
    aiRecommendations: { type: Boolean, default: false },
    autoOptimization: { type: Boolean, default: false },
    smartRouting: { type: Boolean, default: false }
  },

  // Applicability rules
  applicableTo: {
    contentTypes: [{ type: String, enum: ['all', ...require('./ContentItem').ContentTypes] }],
    platforms: [{ type: String, enum: ['all', ...require('./ContentItem').PlatformTypes] }],
    priorities: [{ type: String, enum: ['all', ...require('./ContentItem').Priorities] }],
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [String],
    businessValue: {
      minValue: Number,
      maxValue: Number
    }
  },

  // Analytics and performance
  analytics: {
    totalUsage: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // hours
    approvalRate: { type: Number, default: 0 }, // percentage
    bottleneckStages: [String],
    performanceByStage: [{
      stageName: String,
      averageTime: Number,
      approvalRate: Number,
      escalationRate: Number
    }]
  },

  // Metadata
  description: String,
  tags: [String],
  version: { type: Number, default: 1 },
  parentWorkflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalWorkflow' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastUsedAt: Date,

  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
ApprovalWorkflowSchema.index({ clientId: 1, isDefault: 1 });
ApprovalWorkflowSchema.index({ clientId: 1, isActive: 1 });
ApprovalWorkflowSchema.index({ organizationId: 1, isActive: 1 });
ApprovalWorkflowSchema.index({ 'applicableTo.contentTypes': 1 });
ApprovalWorkflowSchema.index({ 'applicableTo.platforms': 1 });
ApprovalWorkflowSchema.index({ tags: 1 });
ApprovalWorkflowSchema.index({ isDeleted: 1 });

// Text search
ApprovalWorkflowSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Middleware
ApprovalWorkflowSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Sort stages by order
  this.stages.sort((a, b) => a.order - b.order);

  // Ensure only one default workflow per client
  if (this.isDefault && this.isModified('isDefault')) {
    // This will be handled in the service layer to avoid middleware conflicts
  }

  next();
});

// Soft delete middleware
ApprovalWorkflowSchema.pre(/^find/, function() {
  this.where({ isDeleted: { $ne: true } });
});

// Instance methods
ApprovalWorkflowSchema.methods.getStageByOrder = function(order: number) {
  return this.stages.find(s => s.order === order);
};

ApprovalWorkflowSchema.methods.getNextStage = function(currentOrder: number) {
  return this.stages.find(s => s.order === currentOrder + 1);
};

ApprovalWorkflowSchema.methods.getPreviousStage = function(currentOrder: number) {
  return this.stages.find(s => s.order === currentOrder - 1);
};

ApprovalWorkflowSchema.methods.isApplicableToContent = function(contentItem: any) {
  const { applicableTo } = this;

  // Check content types
  if (applicableTo.contentTypes.length &&
      !applicableTo.contentTypes.includes('all') &&
      !applicableTo.contentTypes.includes(contentItem.contentType)) {
    return false;
  }

  // Check platforms
  if (applicableTo.platforms.length &&
      !applicableTo.platforms.includes('all') &&
      !applicableTo.platforms.includes(contentItem.platform)) {
    return false;
  }

  // Check priorities
  if (applicableTo.priorities.length &&
      !applicableTo.priorities.includes('all') &&
      !applicableTo.priorities.includes(contentItem.priority)) {
    return false;
  }

  // Check clients
  if (applicableTo.clients.length &&
      !applicableTo.clients.includes(contentItem.clientId)) {
    return false;
  }

  // Check tags
  if (applicableTo.tags.length) {
    const hasMatchingTag = applicableTo.tags.some(tag =>
      contentItem.tags.includes(tag)
    );
    if (!hasMatchingTag) return false;
  }

  // Check business value
  if (applicableTo.businessValue) {
    const value = contentItem.businessValue?.estimatedRevenue || 0;
    if (applicableTo.businessValue.minValue && value < applicableTo.businessValue.minValue) {
      return false;
    }
    if (applicableTo.businessValue.maxValue && value > applicableTo.businessValue.maxValue) {
      return false;
    }
  }

  return true;
};

ApprovalWorkflowSchema.methods.updateAnalytics = async function(completionTimeHours: number, approved: boolean) {
  this.analytics.totalUsage += 1;

  // Update average completion time
  const currentAvg = this.analytics.averageCompletionTime;
  const usage = this.analytics.totalUsage;
  this.analytics.averageCompletionTime = ((currentAvg * (usage - 1)) + completionTimeHours) / usage;

  // Update approval rate
  const currentRate = this.analytics.approvalRate;
  if (approved) {
    this.analytics.approvalRate = ((currentRate * (usage - 1)) + 100) / usage;
  } else {
    this.analytics.approvalRate = (currentRate * (usage - 1)) / usage;
  }

  this.lastUsedAt = new Date();
  return this.save();
};

ApprovalWorkflowSchema.methods.clone = function(newName: string, createdBy: string) {
  const cloned = new (this.constructor as any)({
    name: newName,
    clientId: this.clientId,
    organizationId: this.organizationId,
    isDefault: false,
    stages: this.stages.map(stage => ({
      ...stage.toObject(),
      _id: new mongoose.Types.ObjectId()
    })),
    settings: { ...this.settings },
    applicableTo: { ...this.applicableTo },
    description: this.description,
    tags: [...this.tags],
    version: 1,
    parentWorkflowId: this._id,
    createdBy
  });

  return cloned;
};

ApprovalWorkflowSchema.methods.softDelete = function(userId: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.isActive = false;
  return this.save();
};

ApprovalWorkflowSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Static methods
ApprovalWorkflowSchema.statics.findApplicableWorkflows = async function(contentItem: any, clientId: string) {
  const workflows = await this.find({
    clientId: new mongoose.Types.ObjectId(clientId),
    isActive: true
  });

  return workflows.filter(workflow => workflow.isApplicableToContent(contentItem));
};

ApprovalWorkflowSchema.statics.getDefaultWorkflow = async function(clientId: string) {
  return this.findOne({
    clientId: new mongoose.Types.ObjectId(clientId),
    isDefault: true,
    isActive: true
  });
};

ApprovalWorkflowSchema.statics.setDefaultWorkflow = async function(workflowId: string, clientId: string) {
  // Remove default from all workflows for this client
  await this.updateMany(
    { clientId: new mongoose.Types.ObjectId(clientId) },
    { $set: { isDefault: false } }
  );

  // Set new default
  return this.findByIdAndUpdate(
    workflowId,
    { $set: { isDefault: true, isActive: true } },
    { new: true }
  );
};

export interface IApprovalWorkflow extends Document {
  name: string;
  clientId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  isDefault: boolean;
  isActive: boolean;
  stages: any[];
  settings: any;
  applicableTo: any;
  analytics: any;
  description?: string;
  tags: string[];
  version: number;
  parentWorkflowId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;

  // Instance methods
  getStageByOrder(order: number): any;
  getNextStage(currentOrder: number): any;
  getPreviousStage(currentOrder: number): any;
  isApplicableToContent(contentItem: any): boolean;
  updateAnalytics(completionTimeHours: number, approved: boolean): Promise<IApprovalWorkflow>;
  clone(newName: string, createdBy: string): IApprovalWorkflow;
  softDelete(userId: string): Promise<IApprovalWorkflow>;
  restore(): Promise<IApprovalWorkflow>;
}

export const ApprovalWorkflow = mongoose.model<IApprovalWorkflow>('ApprovalWorkflow', ApprovalWorkflowSchema);
export default ApprovalWorkflow;