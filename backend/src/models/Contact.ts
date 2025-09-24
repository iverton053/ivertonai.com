import mongoose, { Schema, Document } from 'mongoose';

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

// Indexes for performance
contactSchema.index({ userId: 1, email: 1 }, { unique: true });
contactSchema.index({ userId: 1, leadScore: -1 });
contactSchema.index({ userId: 1, lifecycleStage: 1 });
contactSchema.index({ userId: 1, leadStatus: 1 });
contactSchema.index({ contactOwner: 1 });
contactSchema.index({ lastActivityDate: -1 });
contactSchema.index({ 'sourceDetails.utm_campaign': 1 });
contactSchema.index({ tags: 1 });
contactSchema.index({ company: 1 });

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

export default mongoose.model<IContact>('Contact', contactSchema);