import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  platform: 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'linkedin_ads' | 'twitter_ads' | 'pinterest_ads';
  status: 'active' | 'paused' | 'ended' | 'deleted';
  objective: 'conversions' | 'traffic' | 'awareness' | 'engagement' | 'leads' | 'sales';
  
  // Budget and bidding
  budget: {
    daily: number;
    lifetime?: number;
    currency: string;
  };
  bidding: {
    strategy: 'manual_cpc' | 'target_cpa' | 'target_roas' | 'maximize_conversions' | 'maximize_clicks';
    amount?: number;
    target_cpa?: number;
    target_roas?: number;
  };
  
  // Targeting
  targeting: {
    locations: string[];
    demographics: {
      age_min?: number;
      age_max?: number;
      genders?: string[];
    };
    interests?: string[];
    behaviors?: string[];
    keywords?: string[];
    custom_audiences?: string[];
    lookalike_audiences?: string[];
  };
  
  // Schedule
  schedule: {
    start_date: Date;
    end_date?: Date;
    time_zone: string;
    ad_scheduling?: {
      days_of_week: number[];
      hours_of_day: number[];
    };
  };
  
  // Performance metrics
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
    conversion_rate: number;
    last_updated: Date;
  };
  
  // Platform-specific data
  platform_data: {
    campaign_id?: string;
    ad_set_ids?: string[];
    ad_ids?: string[];
    platform_status?: string;
    platform_errors?: string[];
  };
  
  // Automation settings
  automation: {
    enabled: boolean;
    rules: Array<{
      condition: string;
      threshold: number;
      action: string;
      enabled: boolean;
    }>;
    last_optimization: Date;
    optimization_frequency: number; // hours
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
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
  platform: {
    type: String,
    required: true,
    enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'linkedin_ads', 'twitter_ads', 'pinterest_ads']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'ended', 'deleted'],
    default: 'paused'
  },
  objective: {
    type: String,
    required: true,
    enum: ['conversions', 'traffic', 'awareness', 'engagement', 'leads', 'sales']
  },
  
  budget: {
    daily: {
      type: Number,
      required: true,
      min: 1
    },
    lifetime: {
      type: Number,
      min: 1
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      length: 3
    }
  },
  
  bidding: {
    strategy: {
      type: String,
      required: true,
      enum: ['manual_cpc', 'target_cpa', 'target_roas', 'maximize_conversions', 'maximize_clicks']
    },
    amount: Number,
    target_cpa: Number,
    target_roas: Number
  },
  
  targeting: {
    locations: [{
      type: String,
      required: true
    }],
    demographics: {
      age_min: {
        type: Number,
        min: 18,
        max: 65
      },
      age_max: {
        type: Number,
        min: 18,
        max: 65
      },
      genders: [String]
    },
    interests: [String],
    behaviors: [String],
    keywords: [String],
    custom_audiences: [String],
    lookalike_audiences: [String]
  },
  
  schedule: {
    start_date: {
      type: Date,
      required: true
    },
    end_date: Date,
    time_zone: {
      type: String,
      required: true,
      default: 'UTC'
    },
    ad_scheduling: {
      days_of_week: [{
        type: Number,
        min: 0,
        max: 6
      }],
      hours_of_day: [{
        type: Number,
        min: 0,
        max: 23
      }]
    }
  },
  
  metrics: {
    spend: {
      type: Number,
      default: 0,
      min: 0
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    conversions: {
      type: Number,
      default: 0,
      min: 0
    },
    ctr: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    cpc: {
      type: Number,
      default: 0,
      min: 0
    },
    cpm: {
      type: Number,
      default: 0,
      min: 0
    },
    roas: {
      type: Number,
      default: 0,
      min: 0
    },
    conversion_rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  
  platform_data: {
    campaign_id: String,
    ad_set_ids: [String],
    ad_ids: [String],
    platform_status: String,
    platform_errors: [String]
  },
  
  automation: {
    enabled: {
      type: Boolean,
      default: false
    },
    rules: [{
      condition: {
        type: String,
        required: true
      },
      threshold: {
        type: Number,
        required: true
      },
      action: {
        type: String,
        required: true
      },
      enabled: {
        type: Boolean,
        default: true
      }
    }],
    last_optimization: {
      type: Date,
      default: Date.now
    },
    optimization_frequency: {
      type: Number,
      default: 24
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

// Indexes for performance
campaignSchema.index({ userId: 1, status: 1 });
campaignSchema.index({ platform: 1, status: 1 });
campaignSchema.index({ 'schedule.start_date': 1, 'schedule.end_date': 1 });
campaignSchema.index({ 'metrics.spend': -1 });
campaignSchema.index({ 'metrics.roas': -1 });

export default mongoose.model<ICampaign>('Campaign', campaignSchema);