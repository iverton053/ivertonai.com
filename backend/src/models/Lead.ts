import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadScore extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Scoring components
  demographicScore: {
    total: number;
    factors: {
      jobTitle: number;
      companySize: number;
      industry: number;
      location: number;
    };
  };
  
  behavioralScore: {
    total: number;
    factors: {
      emailEngagement: number;
      websiteActivity: number;
      contentDownloads: number;
      formSubmissions: number;
      socialEngagement: number;
    };
  };
  
  engagementScore: {
    total: number;
    factors: {
      responseTime: number;
      meetingAttendance: number;
      proposalEngagement: number;
      referralActivity: number;
    };
  };
  
  // Final composite score
  compositeScore: number;
  scoreGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // Predictive analytics
  conversionProbability: number;
  estimatedValue: number;
  estimatedTimeToClose: number; // days
  
  // Scoring history
  scoreHistory: Array<{
    date: Date;
    score: number;
    reason: string;
    changedFields: string[];
  }>;
  
  lastUpdated: Date;
}

const leadScoreSchema = new Schema<ILeadScore>({
  leadId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Lead'
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  demographicScore: {
    total: { type: Number, default: 0, min: 0, max: 100 },
    factors: {
      jobTitle: { type: Number, default: 0, min: 0, max: 25 },
      companySize: { type: Number, default: 0, min: 0, max: 25 },
      industry: { type: Number, default: 0, min: 0, max: 25 },
      location: { type: Number, default: 0, min: 0, max: 25 }
    }
  },
  
  behavioralScore: {
    total: { type: Number, default: 0, min: 0, max: 100 },
    factors: {
      emailEngagement: { type: Number, default: 0, min: 0, max: 20 },
      websiteActivity: { type: Number, default: 0, min: 0, max: 20 },
      contentDownloads: { type: Number, default: 0, min: 0, max: 20 },
      formSubmissions: { type: Number, default: 0, min: 0, max: 20 },
      socialEngagement: { type: Number, default: 0, min: 0, max: 20 }
    }
  },
  
  engagementScore: {
    total: { type: Number, default: 0, min: 0, max: 100 },
    factors: {
      responseTime: { type: Number, default: 0, min: 0, max: 25 },
      meetingAttendance: { type: Number, default: 0, min: 0, max: 25 },
      proposalEngagement: { type: Number, default: 0, min: 0, max: 25 },
      referralActivity: { type: Number, default: 0, min: 0, max: 25 }
    }
  },
  
  compositeScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  scoreGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    default: 'F'
  },
  
  conversionProbability: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  estimatedValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  estimatedTimeToClose: {
    type: Number,
    default: 30,
    min: 1
  },
  
  scoreHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    changedFields: [String]
  }],
  
  lastUpdated: {
    type: Date,
    default: Date.now
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
leadScoreSchema.index({ leadId: 1 });
leadScoreSchema.index({ userId: 1, compositeScore: -1 });
leadScoreSchema.index({ scoreGrade: 1 });
leadScoreSchema.index({ conversionProbability: -1 });
leadScoreSchema.index({ lastUpdated: 1 });

export default mongoose.model<ILeadScore>('LeadScore', leadScoreSchema);