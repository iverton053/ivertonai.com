import mongoose, { Schema, Document } from 'mongoose';

export interface IAdAccount extends Document {
  userId: mongoose.Types.ObjectId;
  platform: 'google_ads' | 'facebook_ads' | 'instagram_ads' | 'linkedin_ads' | 'twitter_ads' | 'pinterest_ads';
  account_id: string;
  account_name: string;
  
  // Authentication data
  credentials: {
    access_token?: string;
    refresh_token?: string;
    client_id?: string;
    client_secret?: string;
    developer_token?: string;
    expires_at?: Date;
    scopes?: string[];
  };
  
  // Account details
  account_info: {
    business_name?: string;
    currency: string;
    timezone: string;
    account_type?: string;
    status: 'active' | 'inactive' | 'suspended';
    spending_limit?: number;
    daily_spending_limit?: number;
  };
  
  // Connection status
  connection_status: {
    is_connected: boolean;
    last_sync: Date;
    last_error?: string;
    sync_frequency: number; // minutes
    auto_sync: boolean;
  };
  
  // Performance summary
  performance_summary: {
    total_spend_30d: number;
    total_campaigns: number;
    active_campaigns: number;
    avg_ctr: number;
    avg_roas: number;
    last_updated: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const adAccountSchema = new Schema<IAdAccount>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  platform: {
    type: String,
    required: true,
    enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'linkedin_ads', 'twitter_ads', 'pinterest_ads']
  },
  account_id: {
    type: String,
    required: true,
    trim: true
  },
  account_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  
  credentials: {
    access_token: String,
    refresh_token: String,
    client_id: String,
    client_secret: String,
    developer_token: String,
    expires_at: Date,
    scopes: [String]
  },
  
  account_info: {
    business_name: {
      type: String,
      trim: true,
      maxlength: 255
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      length: 3
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC'
    },
    account_type: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    spending_limit: {
      type: Number,
      min: 0
    },
    daily_spending_limit: {
      type: Number,
      min: 0
    }
  },
  
  connection_status: {
    is_connected: {
      type: Boolean,
      required: true,
      default: true
    },
    last_sync: {
      type: Date,
      default: Date.now
    },
    last_error: String,
    sync_frequency: {
      type: Number,
      default: 60,
      min: 15
    },
    auto_sync: {
      type: Boolean,
      default: true
    }
  },
  
  performance_summary: {
    total_spend_30d: {
      type: Number,
      default: 0,
      min: 0
    },
    total_campaigns: {
      type: Number,
      default: 0,
      min: 0
    },
    active_campaigns: {
      type: Number,
      default: 0,
      min: 0
    },
    avg_ctr: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    avg_roas: {
      type: Number,
      default: 0,
      min: 0
    },
    last_updated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Remove sensitive credentials from JSON output
      if (ret.credentials) {
        delete ret.credentials.access_token;
        delete ret.credentials.refresh_token;
        delete ret.credentials.client_secret;
        delete ret.credentials.developer_token;
      }
      return ret;
    }
  }
});

// Indexes for performance
adAccountSchema.index({ userId: 1, platform: 1 });
adAccountSchema.index({ account_id: 1, platform: 1 }, { unique: true });
adAccountSchema.index({ 'connection_status.is_connected': 1 });
adAccountSchema.index({ 'connection_status.last_sync': 1 });

export default mongoose.model<IAdAccount>('AdAccount', adAccountSchema);