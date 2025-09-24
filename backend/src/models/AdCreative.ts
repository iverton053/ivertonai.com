import mongoose, { Schema, Document } from 'mongoose';

export interface IAdCreative extends Document {
  userId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  name: string;
  platform: 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'linkedin_ads' | 'twitter_ads' | 'pinterest_ads';
  format: 'single_image' | 'single_video' | 'carousel' | 'collection' | 'text_only' | 'dynamic';
  
  // Creative content
  content: {
    headline: string;
    description?: string;
    body_text?: string;
    cta_text: string;
    display_url?: string;
    final_url: string;
  };
  
  // Media assets
  assets: {
    images: Array<{
      url: string;
      width: number;
      height: number;
      file_size: number;
      alt_text?: string;
      primary: boolean;
    }>;
    videos: Array<{
      url: string;
      duration: number;
      thumbnail_url?: string;
      file_size: number;
      format: string;
    }>;
    logos: Array<{
      url: string;
      width: number;
      height: number;
      file_size: number;
    }>;
  };
  
  // AI generation data
  ai_generated: {
    is_ai_generated: boolean;
    generation_prompt?: string;
    ai_service?: 'openai' | 'anthropic' | 'custom';
    generation_date?: Date;
    generation_params?: {
      industry?: string;
      target_audience?: string;
      brand_voice?: 'professional' | 'casual' | 'playful' | 'authoritative' | 'friendly';
      key_benefits?: string[];
      campaign_objective?: string;
    };
  };
  
  // Performance prediction
  performance_prediction: {
    estimated_ctr: number;
    estimated_cpc: number;
    estimated_conversions: number;
    confidence_score: number;
    quality_score: number;
    predicted_by?: string;
    prediction_date: Date;
  };
  
  // A/B testing
  testing: {
    is_test_variant: boolean;
    test_group?: string;
    variant_name?: string;
    control_creative_id?: mongoose.Types.ObjectId;
    test_status?: 'running' | 'paused' | 'completed' | 'winner' | 'loser';
  };
  
  // Performance metrics
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    ctr: number;
    cpc: number;
    conversion_rate: number;
    roas: number;
    quality_score?: number;
    relevance_score?: number;
    last_updated: Date;
  };
  
  // Platform-specific data
  platform_data: {
    creative_id?: string;
    ad_id?: string;
    platform_status?: string;
    platform_errors?: string[];
    approval_status?: 'pending' | 'approved' | 'rejected' | 'under_review';
    rejection_reasons?: string[];
  };
  
  // Additional metadata
  tags: string[];
  hashtags: string[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  
  createdAt: Date;
  updatedAt: Date;
}

const adCreativeSchema = new Schema<IAdCreative>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
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
  format: {
    type: String,
    required: true,
    enum: ['single_image', 'single_video', 'carousel', 'collection', 'text_only', 'dynamic']
  },
  
  content: {
    headline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    body_text: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    cta_text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    display_url: {
      type: String,
      trim: true
    },
    final_url: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  assets: {
    images: [{
      url: {
        type: String,
        required: true
      },
      width: {
        type: Number,
        required: true,
        min: 1
      },
      height: {
        type: Number,
        required: true,
        min: 1
      },
      file_size: {
        type: Number,
        required: true,
        min: 1
      },
      alt_text: String,
      primary: {
        type: Boolean,
        default: false
      }
    }],
    videos: [{
      url: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true,
        min: 1
      },
      thumbnail_url: String,
      file_size: {
        type: Number,
        required: true,
        min: 1
      },
      format: {
        type: String,
        required: true
      }
    }],
    logos: [{
      url: {
        type: String,
        required: true
      },
      width: {
        type: Number,
        required: true,
        min: 1
      },
      height: {
        type: Number,
        required: true,
        min: 1
      },
      file_size: {
        type: Number,
        required: true,
        min: 1
      }
    }]
  },
  
  ai_generated: {
    is_ai_generated: {
      type: Boolean,
      default: false
    },
    generation_prompt: String,
    ai_service: {
      type: String,
      enum: ['openai', 'anthropic', 'custom']
    },
    generation_date: Date,
    generation_params: {
      industry: String,
      target_audience: String,
      brand_voice: {
        type: String,
        enum: ['professional', 'casual', 'playful', 'authoritative', 'friendly']
      },
      key_benefits: [String],
      campaign_objective: String
    }
  },
  
  performance_prediction: {
    estimated_ctr: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    estimated_cpc: {
      type: Number,
      default: 0,
      min: 0
    },
    estimated_conversions: {
      type: Number,
      default: 0,
      min: 0
    },
    confidence_score: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    quality_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    predicted_by: String,
    prediction_date: {
      type: Date,
      default: Date.now
    }
  },
  
  testing: {
    is_test_variant: {
      type: Boolean,
      default: false
    },
    test_group: String,
    variant_name: String,
    control_creative_id: {
      type: Schema.Types.ObjectId,
      ref: 'AdCreative'
    },
    test_status: {
      type: String,
      enum: ['running', 'paused', 'completed', 'winner', 'loser']
    }
  },
  
  metrics: {
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
    spend: {
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
    conversion_rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    roas: {
      type: Number,
      default: 0,
      min: 0
    },
    quality_score: {
      type: Number,
      min: 0,
      max: 10
    },
    relevance_score: {
      type: Number,
      min: 0,
      max: 10
    },
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  
  platform_data: {
    creative_id: String,
    ad_id: String,
    platform_status: String,
    platform_errors: [String],
    approval_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending'
    },
    rejection_reasons: [String]
  },
  
  tags: [String],
  hashtags: [String],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
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
adCreativeSchema.index({ userId: 1, status: 1 });
adCreativeSchema.index({ campaignId: 1 });
adCreativeSchema.index({ platform: 1, status: 1 });
adCreativeSchema.index({ 'ai_generated.is_ai_generated': 1 });
adCreativeSchema.index({ 'metrics.ctr': -1 });
adCreativeSchema.index({ 'metrics.roas': -1 });
adCreativeSchema.index({ 'testing.is_test_variant': 1, 'testing.test_status': 1 });

export default mongoose.model<IAdCreative>('AdCreative', adCreativeSchema);