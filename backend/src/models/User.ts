import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  
  profile: {
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    timezone: string;
    avatar?: string;
  };
  
  preferences: {
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      campaign_alerts: boolean;
      performance_reports: boolean;
      budget_alerts: boolean;
    };
    dashboard: {
      default_date_range: string;
      auto_refresh: boolean;
      refresh_interval: number;
    };
  };
  
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    expires_at?: Date;
    limits: {
      campaigns: number;
      ad_accounts: number;
      monthly_spend: number;
      ai_generations: number;
    };
    usage: {
      campaigns_used: number;
      ad_accounts_used: number;
      monthly_spend_used: number;
      ai_generations_used: number;
    };
  };
  
  security: {
    last_login: Date;
    failed_login_attempts: number;
    account_locked_until?: Date;
    password_changed_at: Date;
    two_factor_enabled: boolean;
    two_factor_secret?: string;
  };
  
  role: 'user' | 'admin' | 'manager';
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(password: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      trim: true,
      match: /^[\+]?[1-9][\d]{0,15}$/
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    avatar: String
  },
  
  preferences: {
    currency: {
      type: String,
      default: 'USD',
      length: 3
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      campaign_alerts: {
        type: Boolean,
        default: true
      },
      performance_reports: {
        type: Boolean,
        default: true
      },
      budget_alerts: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      default_date_range: {
        type: String,
        default: '7d'
      },
      auto_refresh: {
        type: Boolean,
        default: true
      },
      refresh_interval: {
        type: Number,
        default: 300 // 5 minutes
      }
    }
  },
  
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    expires_at: Date,
    limits: {
      campaigns: {
        type: Number,
        default: 3
      },
      ad_accounts: {
        type: Number,
        default: 1
      },
      monthly_spend: {
        type: Number,
        default: 500
      },
      ai_generations: {
        type: Number,
        default: 10
      }
    },
    usage: {
      campaigns_used: {
        type: Number,
        default: 0
      },
      ad_accounts_used: {
        type: Number,
        default: 0
      },
      monthly_spend_used: {
        type: Number,
        default: 0
      },
      ai_generations_used: {
        type: Number,
        default: 0
      }
    }
  },
  
  security: {
    last_login: {
      type: Date,
      default: Date.now
    },
    failed_login_attempts: {
      type: Number,
      default: 0
    },
    account_locked_until: Date,
    password_changed_at: {
      type: Date,
      default: Date.now
    },
    two_factor_enabled: {
      type: Boolean,
      default: false
    },
    two_factor_secret: String
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.security.two_factor_secret;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  this.password = await bcrypt.hash(this.password, rounds);
  this.security.password_changed_at = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 });
userSchema.index({ 'security.last_login': -1 });

export default mongoose.model<IUser>('User', userSchema);