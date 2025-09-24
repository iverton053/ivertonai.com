export type ContentType = 
  | 'social-post' 
  | 'blog-article' 
  | 'email-campaign'
  | 'video-script'
  | 'advertisement'
  | 'press-release'
  | 'newsletter'
  | 'landing-page'
  | 'product-description'
  | 'marketing-copy';

export type ApprovalStatus = 
  | 'draft'
  | 'pending'
  | 'in-review'
  | 'revision-requested'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'scheduled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type CommentStatus = 'active' | 'resolved' | 'archived';
export type CommentType = 'general' | 'approval' | 'revision' | 'question';

export type PlatformType = 
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'website'
  | 'email'
  | 'print'
  | 'other';

export interface ContentVersion {
  id: string;
  versionNumber: number;
  content: {
    title?: string;
    body: string;
    caption?: string;
    hashtags?: string[];
    callToAction?: string;
    mediaUrls?: string[];
    scheduledDate?: Date;
  };
  changes: string[];
  createdAt: Date;
  createdBy: string;
  notes?: string;
}

export interface ApprovalComment {
  id: string;
  contentId: string;
  versionId?: string;
  parentId?: string; // For threaded replies (renamed from parentCommentId for consistency)
  author: string; // Simplified to match store implementation
  text: string; // Renamed from message to match store implementation
  type: CommentType;
  status: CommentStatus;
  mentions: string[]; // User IDs mentioned with @
  attachments?: string[];
  isPinned?: boolean;
  likes?: number;
  createdAt: Date;
  editedAt?: Date;
  reactions?: {
    emoji: string;
    users: string[];
  }[];
}

export interface ApprovalAction {
  id: string;
  contentId: string;
  actionType: 'status_change' | 'comment' | 'version_update' | 'reminder_sent' | 'link_generated';
  fromStatus?: ApprovalStatus;
  toStatus?: ApprovalStatus;
  performedBy: string;
  performedAt: Date;
  details: string;
  metadata?: Record<string, any>;
}

export interface ClientReviewLink {
  id: string;
  contentId: string;
  clientId: string;
  token: string;
  url: string;
  isActive: boolean;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
  settings: {
    allowComments: boolean;
    allowDownload: boolean;
    requirePassword: boolean;
    password?: string;
    notifyOnAccess: boolean;
  };
}

export interface ContentItem {
  id: string;
  clientId: string;
  campaignId?: string;
  title: string;
  description?: string;
  contentType: ContentType;
  platform: PlatformType;
  status: ApprovalStatus;
  priority: Priority;
  
  // Content versions
  versions: ContentVersion[];
  currentVersionId: string;
  
  // Approval workflow
  assignedTo: string[]; // User IDs who need to approve
  approvedBy: string[]; // User IDs who have approved
  rejectedBy?: string[];
  
  // Scheduling
  dueDate?: Date;
  scheduledPublishDate?: Date;
  publishedAt?: Date;
  
  // Metadata
  tags: string[];
  brand?: string;
  targetAudience?: string;
  objectives?: string[];
  
  // Tracking
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  
  // Comments and feedback
  comments: ApprovalComment[];
  totalComments: number;
  unresolvedComments: number;
  
  // Review links
  reviewLinks: ClientReviewLink[];
  
  // Actions history
  actions: ApprovalAction[];
  
  // Reminders
  remindersSent: number;
  lastReminderAt?: Date;
  
  // Performance
  engagementPrediction?: {
    score: number;
    factors: string[];
    suggestions: string[];
  };
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  clientId: string;
  isDefault: boolean;
  stages: {
    id: string;
    name: string;
    status: ApprovalStatus;
    approvers: string[];
    isRequired: boolean;
    autoAdvance: boolean;
    timeLimit?: number; // hours
    order: number;
  }[];
  settings: {
    requireAllApprovers: boolean;
    allowParallelApprovals: boolean;
    autoReminders: boolean;
    reminderInterval: number; // hours
    maxReminders: number;
    escalationAfter?: number; // hours
    escalateTo?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalFilters {
  clientId?: string;
  status?: ApprovalStatus[];
  contentType?: ContentType[];
  platform?: PlatformType[];
  priority?: Priority[];
  assignedTo?: string[];
  createdBy?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchQuery?: string;
  overdue?: boolean;
  hasComments?: boolean;
  needsAction?: boolean;
}

export interface ContentApprovalStats {
  totalContent: number;
  byStatus: Record<ApprovalStatus, number>;
  byContentType: Record<ContentType, number>;
  byPlatform: Record<PlatformType, number>;
  averageApprovalTime: number; // hours
  overdueItems: number;
  pendingApprovals: number;
  approvalRate: number; // percentage
  topPerformers: {
    user: string;
    approvalsCompleted: number;
    averageTime: number;
  }[];
  recentActivity: ApprovalAction[];
  upcomingDeadlines: ContentItem[];
  clientSatisfactionScore: number;
  bottlenecks: {
    stage: string;
    count: number;
    averageTime: number;
  }[];
}

export interface ApprovalNotification {
  id: string;
  userId: string;
  contentId: string;
  type: 'approval_request' | 'status_change' | 'comment_added' | 'deadline_reminder' | 'overdue_alert';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  isSent: boolean;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface ApprovalSettings {
  defaultWorkflowId?: string;
  autoAssignReviewers: boolean;
  enableClientReviewLinks: boolean;
  linkExpirationDays: number;
  enableVersionComparison: boolean;
  enableBulkApprovals: boolean;
  enableSmartReminders: boolean;
  reminderSchedule: {
    first: number; // hours after due date
    subsequent: number; // hours between reminders
    maximum: number; // max reminders
  };
  emailNotifications: {
    approvalRequests: boolean;
    statusChanges: boolean;
    comments: boolean;
    reminders: boolean;
    dailyDigest: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    urgentOnly: boolean;
    phoneNumber?: string;
  };
  approvalThresholds: {
    autoApprove: boolean;
    confidenceThreshold: number; // 0-100
    requireManualReview: string[]; // content types that always need manual review
  };
  clientPortalSettings: {
    allowDirectApproval: boolean;
    showAnalytics: boolean;
    enableFeedback: boolean;
    customBranding: boolean;
  };
}

export interface ContentApprovalState {
  contentItems: ContentItem[];
  workflows: ApprovalWorkflow[];
  notifications: ApprovalNotification[];
  filters: ApprovalFilters;
  selectedItems: string[];
  currentView: 'board' | 'list' | 'calendar' | 'analytics';
  boardColumns: ApprovalStatus[];
  sortBy: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error?: string;
  settings: ApprovalSettings;
  stats: ContentApprovalStats;
}

// Predefined workflow templates
export const DEFAULT_WORKFLOWS: Omit<ApprovalWorkflow, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Standard Social Media Approval',
    isDefault: true,
    stages: [
      {
        id: 'draft',
        name: 'Content Creation',
        status: 'draft',
        approvers: [],
        isRequired: true,
        autoAdvance: false,
        order: 0
      },
      {
        id: 'internal-review',
        name: 'Internal Review',
        status: 'pending',
        approvers: ['team-lead', 'creative-director'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 24,
        order: 1
      },
      {
        id: 'client-review',
        name: 'Client Review',
        status: 'in-review',
        approvers: ['client-contact', 'client-manager'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 48,
        order: 2
      },
      {
        id: 'final-approval',
        name: 'Final Approval',
        status: 'approved',
        approvers: ['account-manager'],
        isRequired: true,
        autoAdvance: true,
        order: 3
      }
    ],
    settings: {
      requireAllApprovers: false,
      allowParallelApprovals: true,
      autoReminders: true,
      reminderInterval: 12,
      maxReminders: 3,
      escalationAfter: 72,
      escalateTo: ['manager', 'director']
    }
  },
  {
    name: 'Fast Track Approval',
    isDefault: false,
    stages: [
      {
        id: 'draft',
        name: 'Content Creation',
        status: 'draft',
        approvers: [],
        isRequired: true,
        autoAdvance: false,
        order: 0
      },
      {
        id: 'quick-review',
        name: 'Quick Review',
        status: 'in-review',
        approvers: ['client-contact'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 2,
        order: 1
      },
      {
        id: 'approved',
        name: 'Approved',
        status: 'approved',
        approvers: [],
        isRequired: false,
        autoAdvance: true,
        order: 2
      }
    ],
    settings: {
      requireAllApprovers: false,
      allowParallelApprovals: true,
      autoReminders: true,
      reminderInterval: 1,
      maxReminders: 2,
      escalationAfter: 4
    }
  },
  {
    name: 'Enterprise Approval',
    isDefault: false,
    stages: [
      {
        id: 'draft',
        name: 'Content Creation',
        status: 'draft',
        approvers: [],
        isRequired: true,
        autoAdvance: false,
        order: 0
      },
      {
        id: 'compliance-review',
        name: 'Compliance Review',
        status: 'pending',
        approvers: ['compliance-officer'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 24,
        order: 1
      },
      {
        id: 'internal-review',
        name: 'Internal Review',
        status: 'pending',
        approvers: ['team-lead', 'creative-director'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 48,
        order: 2
      },
      {
        id: 'legal-review',
        name: 'Legal Review',
        status: 'pending',
        approvers: ['legal-counsel'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 72,
        order: 3
      },
      {
        id: 'client-review',
        name: 'Client Review',
        status: 'in-review',
        approvers: ['client-contact', 'client-manager', 'client-director'],
        isRequired: true,
        autoAdvance: false,
        timeLimit: 48,
        order: 4
      },
      {
        id: 'final-approval',
        name: 'Final Approval',
        status: 'approved',
        approvers: ['account-director'],
        isRequired: true,
        autoAdvance: true,
        order: 5
      }
    ],
    settings: {
      requireAllApprovers: true,
      allowParallelApprovals: false,
      autoReminders: true,
      reminderInterval: 8,
      maxReminders: 5,
      escalationAfter: 96,
      escalateTo: ['vp-accounts', 'executive-director']
    }
  }
];

// Content type templates
export const CONTENT_TEMPLATES: Record<ContentType, {
  name: string;
  fields: string[];
  defaultWorkflow: string;
  platforms: PlatformType[];
}> = {
  'social-post': {
    name: 'Social Media Post',
    fields: ['title', 'body', 'hashtags', 'mediaUrls', 'scheduledDate'],
    defaultWorkflow: 'Standard Social Media Approval',
    platforms: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok']
  },
  'blog-article': {
    name: 'Blog Article',
    fields: ['title', 'body', 'callToAction', 'scheduledDate'],
    defaultWorkflow: 'Enterprise Approval',
    platforms: ['website']
  },
  'email-campaign': {
    name: 'Email Campaign',
    fields: ['title', 'body', 'callToAction', 'scheduledDate'],
    defaultWorkflow: 'Standard Social Media Approval',
    platforms: ['email']
  },
  'video-script': {
    name: 'Video Script',
    fields: ['title', 'body', 'callToAction'],
    defaultWorkflow: 'Enterprise Approval',
    platforms: ['youtube', 'tiktok', 'instagram']
  },
  'advertisement': {
    name: 'Advertisement',
    fields: ['title', 'body', 'callToAction', 'mediaUrls'],
    defaultWorkflow: 'Enterprise Approval',
    platforms: ['facebook', 'instagram', 'twitter', 'linkedin', 'print']
  },
  'press-release': {
    name: 'Press Release',
    fields: ['title', 'body'],
    defaultWorkflow: 'Enterprise Approval',
    platforms: ['website', 'other']
  },
  'newsletter': {
    name: 'Newsletter',
    fields: ['title', 'body', 'callToAction', 'scheduledDate'],
    defaultWorkflow: 'Standard Social Media Approval',
    platforms: ['email']
  },
  'landing-page': {
    name: 'Landing Page',
    fields: ['title', 'body', 'callToAction', 'mediaUrls'],
    defaultWorkflow: 'Enterprise Approval',
    platforms: ['website']
  },
  'product-description': {
    name: 'Product Description',
    fields: ['title', 'body', 'mediaUrls'],
    defaultWorkflow: 'Standard Social Media Approval',
    platforms: ['website', 'other']
  },
  'marketing-copy': {
    name: 'Marketing Copy',
    fields: ['title', 'body', 'callToAction'],
    defaultWorkflow: 'Standard Social Media Approval',
    platforms: ['website', 'email', 'print', 'other']
  }
};

// Platform-specific settings
export const PLATFORM_SETTINGS: Record<PlatformType, {
  name: string;
  icon: string;
  characterLimits: {
    title?: number;
    body?: number;
    hashtags?: number;
  };
  mediaRequirements?: {
    formats: string[];
    maxSize: number;
    dimensions?: { width: number; height: number }[];
  };
}> = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    characterLimits: { body: 63206 },
    mediaRequirements: {
      formats: ['jpg', 'png', 'gif', 'mp4'],
      maxSize: 100 * 1024 * 1024, // 100MB
      dimensions: [{ width: 1200, height: 630 }]
    }
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    characterLimits: { body: 2200, hashtags: 30 },
    mediaRequirements: {
      formats: ['jpg', 'png', 'mp4'],
      maxSize: 100 * 1024 * 1024,
      dimensions: [{ width: 1080, height: 1080 }, { width: 1080, height: 1350 }]
    }
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    characterLimits: { body: 280 },
    mediaRequirements: {
      formats: ['jpg', 'png', 'gif', 'mp4'],
      maxSize: 512 * 1024 * 1024, // 512MB for video
      dimensions: [{ width: 1200, height: 675 }]
    }
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    characterLimits: { body: 3000 },
    mediaRequirements: {
      formats: ['jpg', 'png', 'gif', 'mp4'],
      maxSize: 5 * 1024 * 1024, // 5MB
      dimensions: [{ width: 1200, height: 627 }]
    }
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    characterLimits: { body: 150 },
    mediaRequirements: {
      formats: ['mp4'],
      maxSize: 500 * 1024 * 1024,
      dimensions: [{ width: 1080, height: 1920 }]
    }
  },
  youtube: {
    name: 'YouTube',
    icon: '📹',
    characterLimits: { title: 100, body: 5000 },
    mediaRequirements: {
      formats: ['mp4', 'mov', 'avi'],
      maxSize: 256 * 1024 * 1024 * 1024, // 256GB
      dimensions: [{ width: 1920, height: 1080 }]
    }
  },
  website: {
    name: 'Website',
    icon: '🌐',
    characterLimits: {},
    mediaRequirements: {
      formats: ['jpg', 'png', 'webp', 'svg'],
      maxSize: 10 * 1024 * 1024
    }
  },
  email: {
    name: 'Email',
    icon: '📧',
    characterLimits: { title: 50 },
    mediaRequirements: {
      formats: ['jpg', 'png', 'gif'],
      maxSize: 1 * 1024 * 1024
    }
  },
  print: {
    name: 'Print',
    icon: '🖨️',
    characterLimits: {},
    mediaRequirements: {
      formats: ['pdf', 'jpg', 'png'],
      maxSize: 50 * 1024 * 1024
    }
  },
  other: {
    name: 'Other',
    icon: '📄',
    characterLimits: {},
    mediaRequirements: {
      formats: ['jpg', 'png', 'pdf'],
      maxSize: 10 * 1024 * 1024
    }
  }
};