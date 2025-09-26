import mongoose, { Schema, Document } from 'mongoose';
import { AuditService } from '../services/auditService';
import { CustomFieldValidator } from './CustomField';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  
  // Address Information
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  
  // Contact Details
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  
  // Relationship Status
  contactOwner: mongoose.Types.ObjectId; // Assigned sales rep
  lifecycleStage: 'subscriber' | 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'customer' | 'evangelist' | 'other';
  leadStatus: 'new' | 'open' | 'in_progress' | 'open_deal' | 'unqualified' | 'attempted_to_contact' | 'connected' | 'bad_timing';
  
  // Scoring and Analytics
  leadScore: number;
  lastActivityDate?: Date;
  firstTouchpoint?: string;
  lastTouchpoint?: string;
  
  // Custom Properties
  customFields: Map<string, any>;
  tags: string[];
  
  // Communication Preferences
  preferences: {
    emailOptIn: boolean;
    phoneOptIn: boolean;
    smsOptIn: boolean;
    communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    preferredContactMethod: 'email' | 'phone' | 'sms' | 'social';
  };
  
  // Engagement History
  activities: Array<{
    type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'deal' | 'property_change';
    subject?: string;
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    metadata?: any;
  }>;
  
  // Deal Association
  associatedDeals: mongoose.Types.ObjectId[];
  
  // Source Information
  originalSource: string;
  sourceDetails: {
    campaign?: string;
    medium?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  
  // Data Quality
  dataQuality: {
    score: number; // 0-100
    completeness: number; // 0-100
    lastEnrichment?: Date;
    enrichmentSource?: string;
  };
  
  // System Fields
  isActive: boolean;
  mergedInto?: mongoose.Types.ObjectId; // If contact was merged
  
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/
  },
  company: {
    type: String,
    trim: true,
    maxlength: 200
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: 150
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Social Profiles
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  
  // Relationship Status
  contactOwner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lifecycleStage: {
    type: String,
    enum: ['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist', 'other'],
    default: 'lead'
  },
  leadStatus: {
    type: String,
    enum: ['new', 'open', 'in_progress', 'open_deal', 'unqualified', 'attempted_to_contact', 'connected', 'bad_timing'],
    default: 'new'
  },
  
  // Scoring and Analytics
  leadScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastActivityDate: Date,
  firstTouchpoint: String,
  lastTouchpoint: String,
  
  // Custom Properties
  customFields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  tags: [String],
  
  // Communication Preferences
  preferences: {
    emailOptIn: {
      type: Boolean,
      default: true
    },
    phoneOptIn: {
      type: Boolean,
      default: false
    },
    smsOptIn: {
      type: Boolean,
      default: false
    },
    communicationFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'weekly'
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'social'],
      default: 'email'
    }
  },
  
  // Activities
  activities: [{
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'note', 'task', 'deal', 'property_change'],
      required: true
    },
    subject: String,
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
  
  // Deal Association
  associatedDeals: [{
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  
  // Source Information
  originalSource: {
    type: String,
    required: true,
    default: 'manual'
  },
  sourceDetails: {
    campaign: String,
    medium: String,
    referrer: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String,
    utm_term: String,
    utm_content: String
  },
  
  // Data Quality
  dataQuality: {
    score: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    completeness: {
      type: Number,
      default: 30,
      min: 0,
      max: 100
    },
    lastEnrichment: Date,
    enrichmentSource: String
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  mergedInto: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      ret.fullName = `${ret.firstName} ${ret.lastName}`;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Comprehensive indexes for performance optimization
contactSchema.index({ userId: 1, email: 1 }, { unique: true });
contactSchema.index({ userId: 1, isActive: 1 });
contactSchema.index({ userId: 1, leadScore: -1 });
contactSchema.index({ userId: 1, lifecycleStage: 1 });
contactSchema.index({ userId: 1, leadStatus: 1 });
contactSchema.index({ userId: 1, contactOwner: 1 });
contactSchema.index({ userId: 1, lastActivityDate: -1 });
contactSchema.index({ userId: 1, createdAt: -1 });
contactSchema.index({ userId: 1, updatedAt: -1 });

// Text search indexes
contactSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  company: 'text',
  jobTitle: 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 8,
    company: 6,
    jobTitle: 4
  },
  name: 'contact_text_search'
});

// Compound indexes for complex queries
contactSchema.index({ userId: 1, leadScore: -1, lifecycleStage: 1 });
contactSchema.index({ userId: 1, leadStatus: 1, contactOwner: 1 });
contactSchema.index({ userId: 1, company: 1, leadScore: -1 });
contactSchema.index({ userId: 1, lastActivityDate: -1, leadScore: -1 });

// Source and campaign tracking indexes
contactSchema.index({ 'sourceDetails.utm_campaign': 1 });
contactSchema.index({ 'sourceDetails.utm_source': 1 });
contactSchema.index({ originalSource: 1 });

// Array and nested field indexes
contactSchema.index({ tags: 1 });
contactSchema.index({ associatedDeals: 1 });
contactSchema.index({ 'activities.type': 1 });
contactSchema.index({ 'activities.createdAt': -1 });

// Geospatial index for location-based queries
contactSchema.index({ 'address.country': 1, 'address.state': 1, 'address.city': 1 });

// Data quality and scoring indexes
contactSchema.index({ 'dataQuality.score': -1 });
contactSchema.index({ 'dataQuality.completeness': -1 });

// Sparse indexes for optional fields
contactSchema.index({ phone: 1 }, { sparse: true });
contactSchema.index({ mergedInto: 1 }, { sparse: true });

// Reference validation middleware
contactSchema.pre('save', async function(next) {
  // Validate userId exists
  if (this.userId && this.isModified('userId')) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.userId);
    if (!userExists) {
      const error = new Error('Referenced User does not exist');
      return next(error);
    }
  }

  // Validate contactOwner exists
  if (this.contactOwner && this.isModified('contactOwner')) {
    const User = mongoose.model('User');
    const ownerExists = await User.findById(this.contactOwner);
    if (!ownerExists) {
      const error = new Error('Referenced Contact Owner does not exist');
      return next(error);
    }
  }

  // Validate associatedDeals exist
  if (this.associatedDeals && this.associatedDeals.length > 0 && this.isModified('associatedDeals')) {
    const Deal = mongoose.model('Deal');
    for (const dealId of this.associatedDeals) {
      const dealExists = await Deal.findById(dealId);
      if (!dealExists) {
        const error = new Error(`Referenced Deal ${dealId} does not exist`);
        return next(error);
      }
    }
  }

  // Validate activities.createdBy references
  if (this.activities && this.isModified('activities')) {
    const User = mongoose.model('User');
    for (const activity of this.activities) {
      if (activity.createdBy) {
        const userExists = await User.findById(activity.createdBy);
        if (!userExists) {
          const error = new Error(`Referenced User ${activity.createdBy} in activity does not exist`);
          return next(error);
        }
      }
    }
  }

  // Validate custom fields
  if (this.customFields && this.customFields.size > 0) {
    const validation = await CustomFieldValidator.validateCustomFields(
      this.customFields,
      this.userId.toString(),
      'Contact'
    );

    if (!validation.valid) {
      const error = new Error(`Custom field validation failed: ${validation.errors.join(', ')}`);
      return next(error);
    }
  }

  next();
});

// Pre-save middleware to calculate data quality
contactSchema.pre('save', function(next) {
  // Calculate completeness score
  let completenessScore = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'company', 
    'jobTitle', 'address.city', 'address.country'
  ];
  
  fields.forEach(field => {
    const fieldPath = field.split('.');
    let value = this as any;
    
    for (const path of fieldPath) {
      value = value?.[path];
    }
    
    if (value && value.toString().trim()) {
      completenessScore += 100 / fields.length;
    }
  });
  
  this.dataQuality.completeness = Math.round(completenessScore);
  
  // Update last activity date if activities were added
  if (this.activities && this.activities.length > 0) {
    const latestActivity = this.activities[this.activities.length - 1];
    this.lastActivityDate = latestActivity.createdAt;
  }
  
  next();
});

// Audit logging middleware
contactSchema.post('save', async function(doc, next) {
  try {
    const auditService = AuditService.getInstance();

    if (this.isNew) {
      // New contact created
      await auditService.logContactCreate(doc._id.toString(), doc.toObject(), {
        userId: doc.userId.toString(),
        source: 'api'
      });
    } else {
      // Contact updated - we would need the original document to track changes
      // This is a simplified version; in production you'd want to track specific changes
      const changes = this.getChanges?.() || [];
      if (changes.length > 0) {
        await auditService.logAction('UPDATE', 'Contact', doc._id.toString(), changes, {
          userId: doc.userId.toString(),
          source: 'api'
        });
      }
    }
  } catch (error) {
    // Log error but don't fail the save operation
    console.error('Audit logging failed:', error);
  }
  next();
});

contactSchema.post('deleteOne', { document: true, query: false }, async function(doc, next) {
  try {
    const auditService = AuditService.getInstance();
    await auditService.logContactDelete(doc._id.toString(), doc.toObject(), {
      userId: doc.userId.toString(),
      source: 'api',
      reason: 'Contact soft deleted'
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
  next();
});

export default mongoose.model<IContact>('Contact', contactSchema);