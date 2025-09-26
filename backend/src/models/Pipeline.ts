import mongoose, { Schema, Document } from 'mongoose';

export interface IPipelineStage extends Document {
  name: string;
  order: number;
  probability: number; // Conversion probability %
  color: string;
  isClosedWon: boolean;
  isClosedLost: boolean;
  automatedActions: Array<{
    trigger: 'enter' | 'exit' | 'duration';
    duration?: number; // days
    action: 'email' | 'task' | 'notification' | 'webhook';
    config: any;
  }>;
}

export interface IPipeline extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  stages: IPipelineStage[];
  
  // Analytics
  metrics: {
    totalDeals: number;
    totalValue: number;
    avgDealSize: number;
    avgSalesCycle: number; // days
    conversionRate: number;
    monthlyRecurringRevenue: number;
  };
  
  // Settings
  settings: {
    currency: string;
    rottenDays: number; // Days before deal is considered rotten
    autoProgressDeals: boolean;
    requireWinLossReason: boolean;
    enableProbabilityWeighting: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeal extends Document {
  userId: mongoose.Types.ObjectId;
  pipelineId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  contactId?: mongoose.Types.ObjectId;
  
  // Deal basics
  title: string;
  description?: string;
  value: number;
  currency: string;
  
  // Status and stage
  currentStage: mongoose.Types.ObjectId;
  probability: number;
  status: 'open' | 'won' | 'lost';
  
  // Dates
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  createdDate: Date;
  lastActivityDate: Date;
  
  // Assignment
  assignedTo: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  
  // Tracking
  source: string;
  tags: string[];
  lostReason?: string;
  winReason?: string;
  
  // Automation tracking
  stageHistory: Array<{
    stage: mongoose.Types.ObjectId;
    enteredAt: Date;
    exitedAt?: Date;
    duration?: number; // days
    enteredBy: mongoose.Types.ObjectId;
  }>;
  
  activities: Array<{
    type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'stage_change';
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    metadata?: any;
  }>;
  
  // Forecasting
  forecastCategory: 'commit' | 'best_case' | 'pipeline' | 'omitted';
  weightedValue: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const pipelineStageSchema = new Schema<IPipelineStage>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i
  },
  isClosedWon: {
    type: Boolean,
    default: false
  },
  isClosedLost: {
    type: Boolean,
    default: false
  },
  automatedActions: [{
    trigger: {
      type: String,
      enum: ['enter', 'exit', 'duration'],
      required: true
    },
    duration: {
      type: Number,
      min: 1
    },
    action: {
      type: String,
      enum: ['email', 'task', 'notification', 'webhook'],
      required: true
    },
    config: Schema.Types.Mixed
  }]
});

const pipelineSchema = new Schema<IPipeline>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  stages: [pipelineStageSchema],
  
  metrics: {
    totalDeals: {
      type: Number,
      default: 0,
      min: 0
    },
    totalValue: {
      type: Number,
      default: 0,
      min: 0
    },
    avgDealSize: {
      type: Number,
      default: 0,
      min: 0
    },
    avgSalesCycle: {
      type: Number,
      default: 30,
      min: 1
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    monthlyRecurringRevenue: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  settings: {
    currency: {
      type: String,
      required: true,
      default: 'USD',
      length: 3
    },
    rottenDays: {
      type: Number,
      default: 30,
      min: 1
    },
    autoProgressDeals: {
      type: Boolean,
      default: false
    },
    requireWinLossReason: {
      type: Boolean,
      default: true
    },
    enableProbabilityWeighting: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const dealSchema = new Schema<IDeal>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  pipelineId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Pipeline'
  },
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead'
  },
  contactId: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    length: 3
  },
  
  currentStage: {
    type: Schema.Types.ObjectId,
    required: true
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['open', 'won', 'lost'],
    default: 'open'
  },
  
  expectedCloseDate: {
    type: Date,
    required: true
  },
  actualCloseDate: Date,
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  
  assignedTo: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  source: {
    type: String,
    required: true,
    default: 'manual'
  },
  tags: [String],
  lostReason: String,
  winReason: String,
  
  stageHistory: [{
    stage: {
      type: Schema.Types.ObjectId,
      required: true
    },
    enteredAt: {
      type: Date,
      default: Date.now
    },
    exitedAt: Date,
    duration: Number,
    enteredBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }],
  
  activities: [{
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'task', 'stage_change'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    metadata: Schema.Types.Mixed
  }],
  
  forecastCategory: {
    type: String,
    enum: ['commit', 'best_case', 'pipeline', 'omitted'],
    default: 'pipeline'
  },
  weightedValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Pipeline indexes for performance
pipelineSchema.index({ userId: 1, isDefault: 1 });
pipelineSchema.index({ userId: 1, createdAt: -1 });
pipelineSchema.index({ userId: 1, name: 1 });

// Deal indexes for performance and queries
dealSchema.index({ userId: 1, status: 1 });
dealSchema.index({ userId: 1, pipelineId: 1 });
dealSchema.index({ userId: 1, assignedTo: 1 });
dealSchema.index({ userId: 1, createdAt: -1 });
dealSchema.index({ userId: 1, updatedAt: -1 });
dealSchema.index({ userId: 1, lastActivityDate: -1 });

// Compound indexes for complex queries
dealSchema.index({ userId: 1, status: 1, assignedTo: 1 });
dealSchema.index({ userId: 1, pipelineId: 1, currentStage: 1 });
dealSchema.index({ userId: 1, status: 1, expectedCloseDate: 1 });
dealSchema.index({ userId: 1, value: -1, status: 1 });
dealSchema.index({ userId: 1, forecastCategory: 1, status: 1 });

// Date-based indexes for time-series queries
dealSchema.index({ expectedCloseDate: 1, status: 1 });
dealSchema.index({ actualCloseDate: -1 }, { sparse: true });
dealSchema.index({ lastActivityDate: -1, status: 1 });
dealSchema.index({ createdDate: -1 });

// Reference indexes
dealSchema.index({ contactId: 1 }, { sparse: true });
dealSchema.index({ leadId: 1 }, { sparse: true });
dealSchema.index({ teamMembers: 1 });

// Array and nested field indexes
dealSchema.index({ tags: 1 });
dealSchema.index({ source: 1 });
dealSchema.index({ 'activities.type': 1 });
dealSchema.index({ 'activities.createdAt': -1 });
dealSchema.index({ 'stageHistory.stage': 1 });
dealSchema.index({ 'stageHistory.enteredAt': -1 });

// Text search index for deals
dealSchema.index({
  title: 'text',
  description: 'text'
}, {
  weights: {
    title: 10,
    description: 5
  },
  name: 'deal_text_search'
});

// Pipeline reference validation middleware
pipelineSchema.pre('save', async function(next) {
  // Validate userId exists
  if (this.userId && this.isModified('userId')) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.userId);
    if (!userExists) {
      const error = new Error('Referenced User does not exist');
      return next(error);
    }
  }
  next();
});

// Deal reference validation middleware
dealSchema.pre('save', async function(next) {
  // Validate userId exists
  if (this.userId && this.isModified('userId')) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.userId);
    if (!userExists) {
      const error = new Error('Referenced User does not exist');
      return next(error);
    }
  }

  // Validate pipelineId exists
  if (this.pipelineId && this.isModified('pipelineId')) {
    const Pipeline = mongoose.model('Pipeline');
    const pipelineExists = await Pipeline.findById(this.pipelineId);
    if (!pipelineExists) {
      const error = new Error('Referenced Pipeline does not exist');
      return next(error);
    }
  }

  // Validate contactId exists (if provided)
  if (this.contactId && this.isModified('contactId')) {
    const Contact = mongoose.model('Contact');
    const contactExists = await Contact.findById(this.contactId);
    if (!contactExists) {
      const error = new Error('Referenced Contact does not exist');
      return next(error);
    }
  }

  // Validate assignedTo exists
  if (this.assignedTo && this.isModified('assignedTo')) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.assignedTo);
    if (!userExists) {
      const error = new Error('Referenced assigned User does not exist');
      return next(error);
    }
  }

  // Validate teamMembers exist
  if (this.teamMembers && this.teamMembers.length > 0 && this.isModified('teamMembers')) {
    const User = mongoose.model('User');
    for (const userId of this.teamMembers) {
      const userExists = await User.findById(userId);
      if (!userExists) {
        const error = new Error(`Referenced team member ${userId} does not exist`);
        return next(error);
      }
    }
  }

  // Calculate weighted value based on probability
  if (this.isModified('value') || this.isModified('probability')) {
    this.weightedValue = (this.value * this.probability) / 100;
  }

  next();
});

// Pre-remove middleware to handle cascading deletes
dealSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // Remove deal reference from associated contact
  if (this.contactId) {
    const Contact = mongoose.model('Contact');
    await Contact.findByIdAndUpdate(
      this.contactId,
      { $pull: { associatedDeals: this._id } }
    );
  }
  next();
});

export const Pipeline = mongoose.model<IPipeline>('Pipeline', pipelineSchema);
export const Deal = mongoose.model<IDeal>('Deal', dealSchema);