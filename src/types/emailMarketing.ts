// ============================================
// EMAIL MARKETING SYSTEM TYPES
// Enterprise-grade TypeScript interfaces
// ============================================

export interface EmailServiceProvider {
  id: string;
  name: 'resend' | 'sendgrid' | 'aws_ses' | 'mailgun';
  apiKey: string;
  apiEndpoint?: string;
  dailyLimit: number;
  monthlyLimit: number;
  isActive: boolean;
  isPrimary: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  agencyId: string;
  clientId: string;
  
  // Campaign details
  name: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  
  // Content
  htmlContent?: string;
  textContent?: string;
  jsonContent?: EmailBuilderData; // Drag & drop builder data
  templateId?: string;
  
  // Campaign settings
  campaignType: CampaignType;
  status: CampaignStatus;
  priority: number; // 1-10
  
  // Scheduling
  sendTime?: string;
  timezone: string;
  sendImmediately: boolean;
  
  // A/B Testing
  abTestEnabled: boolean;
  abTestConfig?: ABTestConfig;
  abWinnerCriteria?: 'open_rate' | 'click_rate' | 'conversion_rate';
  abTestDurationHours: number;
  
  // Advanced settings
  trackOpens: boolean;
  trackClicks: boolean;
  trackUnsubscribes: boolean;
  customTrackingDomain?: string;
  unsubscribeGroups: string[];
  
  // Target audience
  listIds: string[];
  
  // AI Predictions
  predictedOpenRate?: number;
  predictedClickRate?: number;
  predictedConversionRate?: number;
  predictionConfidence?: number;
  
  // Metadata
  tags: string[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignType = 
  | 'newsletter' 
  | 'promotional' 
  | 'transactional' 
  | 'drip' 
  | 'a_b_test'
  | 'welcome'
  | 'abandoned_cart'
  | 're_engagement';

export type CampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sending' 
  | 'sent' 
  | 'paused' 
  | 'cancelled'
  | 'completed';

export interface ABTestConfig {
  testType: 'subject' | 'content' | 'send_time' | 'from_name';
  variantA: {
    name: string;
    subject?: string;
    content?: string;
    sendTime?: string;
    fromName?: string;
  };
  variantB: {
    name: string;
    subject?: string;
    content?: string;
    sendTime?: string;
    fromName?: string;
  };
  testPercentage: number; // What % of list gets A/B test
  winnerPercentage: number; // What % gets the winner
}

export interface EmailTemplate {
  id: string;
  agencyId: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  
  // Template content
  htmlContent: string;
  textContent?: string;
  jsonContent?: EmailBuilderData;
  thumbnailUrl?: string;
  
  // Template metadata
  isPublic: boolean;
  isPremium: boolean;
  industryTags: string[];
  
  // Usage stats
  usageCount: number;
  lastUsedAt?: string;
  
  // Versioning
  version: number;
  parentTemplateId?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 
  | 'newsletter' 
  | 'promotional' 
  | 'welcome' 
  | 'abandoned_cart'
  | 'event'
  | 'survey'
  | 're_engagement'
  | 'product_update'
  | 'seasonal';

export interface EmailSubscriber {
  id: string;
  agencyId: string;
  clientId: string;
  
  // Basic info
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  
  // Advanced fields
  customFields: Record<string, any>;
  tags: string[];
  source: SubscriberSource;
  acquisitionCampaign?: string;
  
  // Preferences
  preferredLanguage: string;
  timezone?: string;
  preferredSendTime?: string;
  frequencyPreference: FrequencyPreference;
  
  // Status and engagement
  status: SubscriberStatus;
  engagementScore: number; // 0-100
  lastEngagementAt?: string;
  
  // Behavioral data
  totalOpens: number;
  totalClicks: number;
  avgOpenRate: number;
  avgClickRate: number;
  lastOpenAt?: string;
  lastClickAt?: string;
  
  // Lifecycle
  subscribedAt: string;
  unsubscribedAt?: string;
  unsubscribeReason?: string;
  
  // Integration data
  crmContactId?: string;
  externalIds: Record<string, string>;
  
  createdAt: string;
  updatedAt: string;
}

export type SubscriberSource = 
  | 'website' 
  | 'import' 
  | 'api' 
  | 'manual'
  | 'social_media'
  | 'referral'
  | 'integration';

export type SubscriberStatus = 
  | 'active' 
  | 'unsubscribed' 
  | 'bounced' 
  | 'complained'
  | 'pending'
  | 'suppressed';

export type FrequencyPreference = 
  | 'daily' 
  | 'weekly' 
  | 'monthly'
  | 'quarterly'
  | 'as_needed';

export interface EmailList {
  id: string;
  agencyId: string;
  clientId: string;
  
  name: string;
  description?: string;
  listType: ListType;
  
  // Smart list rules (for dynamic lists)
  segmentRules?: SegmentRule[];
  refreshFrequency: RefreshFrequency;
  
  // List settings
  doubleOptIn: boolean;
  welcomeEmailTemplateId?: string;
  
  // Stats (cached for performance)
  subscriberCount: number;
  activeSubscriberCount: number;
  growthRate: number;
  lastRefreshedAt?: string;
  
  // Metadata
  tags: string[];
  isArchived: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ListType = 
  | 'static' 
  | 'dynamic' 
  | 'smart'
  | 'imported'
  | 'api_generated';

export type RefreshFrequency = 
  | 'real_time' 
  | 'hourly' 
  | 'daily' 
  | 'weekly'
  | 'manual';

export interface SegmentRule {
  id: string;
  field: string;
  operator: SegmentOperator;
  value: any;
  logicOperator?: 'AND' | 'OR';
}

export type SegmentOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with' 
  | 'ends_with'
  | 'greater_than' 
  | 'less_than'
  | 'in' 
  | 'not_in'
  | 'exists' 
  | 'not_exists';

export interface EmailWorkflow {
  id: string;
  agencyId: string;
  clientId: string;
  
  name: string;
  description?: string;
  workflowType: WorkflowType;
  
  // Trigger configuration
  triggerType: TriggerType;
  triggerConfig: WorkflowTriggerConfig;
  
  // Workflow steps
  steps: WorkflowStep[];
  
  // Settings
  status: WorkflowStatus;
  maxEntriesPerContact: number;
  allowReEntry: boolean;
  
  // Performance tracking
  totalEntries: number;
  totalCompletions: number;
  completionRate: number;
  
  // n8n integration
  n8nWorkflowId?: string;
  n8nWebhookUrl?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkflowType = 
  | 'welcome' 
  | 'abandoned_cart' 
  | 're_engagement' 
  | 'nurture'
  | 'educational'
  | 'promotional'
  | 'survey'
  | 'birthday';

export type TriggerType = 
  | 'list_subscription' 
  | 'custom_event' 
  | 'date_based' 
  | 'behavior'
  | 'api_trigger'
  | 'webhook';

export type WorkflowStatus = 
  | 'active' 
  | 'paused' 
  | 'draft'
  | 'archived';

export interface WorkflowTriggerConfig {
  listIds?: string[];
  eventName?: string;
  eventProperties?: Record<string, any>;
  dateField?: string;
  daysBefore?: number;
  daysAfter?: number;
  behaviorRules?: SegmentRule[];
  webhookUrl?: string;
}

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  delay?: WorkflowDelay;
  conditions?: SegmentRule[];
  config: WorkflowStepConfig;
  position: { x: number; y: number };
}

export type WorkflowStepType = 
  | 'send_email' 
  | 'wait' 
  | 'condition' 
  | 'add_to_list'
  | 'remove_from_list' 
  | 'update_field' 
  | 'webhook'
  | 'n8n_trigger';

export interface WorkflowDelay {
  type: 'immediate' | 'delay' | 'specific_time' | 'optimal_time';
  value?: number;
  unit?: 'minutes' | 'hours' | 'days' | 'weeks';
  time?: string; // HH:MM format
}

export interface WorkflowStepConfig {
  // Email step config
  templateId?: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  
  // List action config
  listId?: string;
  
  // Field update config
  fieldName?: string;
  fieldValue?: any;
  
  // Webhook config
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST';
  webhookHeaders?: Record<string, string>;
  webhookBody?: Record<string, any>;
  
  // n8n config
  n8nWebhookUrl?: string;
  n8nPayload?: Record<string, any>;
}

export interface EmailEvent {
  id: string;
  campaignId?: string;
  subscriberId: string;
  messageId: string; // ESP message ID
  
  // Event details
  eventType: EmailEventType;
  eventTimestamp: string;
  
  // Event data
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: DeviceType;
  emailClient?: string;
  
  // Click-specific data
  clickedUrl?: string;
  linkIndex?: number;
  
  // Bounce/complaint data
  bounceReason?: string;
  bounceType?: 'hard' | 'soft';
  complaintFeedbackType?: string;
  
  // Revenue attribution
  attributedRevenue?: number;
  attributedConversion?: boolean;
  conversionType?: string;
  conversionValue?: number;
  
  // A/B test data
  abTestVariant?: string;
  
  // Raw ESP data
  espData?: Record<string, any>;
  
  createdAt: string;
}

export type EmailEventType = 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'clicked'
  | 'bounced' 
  | 'complained' 
  | 'unsubscribed'
  | 'marked_as_spam'
  | 'deferred';

export type DeviceType = 
  | 'desktop' 
  | 'mobile' 
  | 'tablet'
  | 'unknown';

export interface EmailAnalytics {
  campaignId: string;
  
  // Basic metrics
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsBounced: number;
  emailsComplained: number;
  emailsUnsubscribed: number;
  
  // Calculated rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
  clickToOpenRate: number;
  
  // Advanced metrics
  uniqueOpens: number;
  uniqueClicks: number;
  forwardCount: number;
  printCount: number;
  
  // Revenue attribution
  totalAttributedRevenue: number;
  totalConversions: number;
  revenuePerRecipient: number;
  roiPercentage: number;
  
  // Device/client breakdown
  desktopOpens: number;
  mobileOpens: number;
  tabletOpens: number;
  
  // Geographic data
  topCountries: Array<{ country: string; count: number; percentage: number }>;
  topRegions: Array<{ region: string; count: number; percentage: number }>;
  
  // Time-based metrics
  bestSendTime?: string;
  avgTimeToOpen?: string; // Duration
  avgTimeToClick?: string; // Duration
  
  lastCalculatedAt: string;
  createdAt: string;
}

export interface ClickHeatmap {
  id: string;
  campaignId: string;
  
  // Click coordinates
  clickX: number;
  clickY: number;
  elementSelector?: string;
  elementText?: string;
  
  // Aggregated data
  clickCount: number;
  uniqueClicks: number;
  
  createdAt: string;
}

export interface RevenueAttribution {
  id: string;
  subscriberId: string;
  campaignId?: string;
  workflowId?: string;
  
  // Attribution model
  attributionModel: AttributionModel;
  attributionWindowHours: number;
  
  // Revenue data
  orderId?: string;
  revenueAmount: number;
  currency: string;
  commissionRate?: number;
  
  // Attribution details
  touchpointSequence: EmailTouchpoint[];
  attributionPercentage: number;
  
  // Timestamps
  firstTouchAt?: string;
  lastTouchAt?: string;
  conversionAt: string;
  
  createdAt: string;
}

export type AttributionModel = 
  | 'first_click' 
  | 'last_click' 
  | 'linear' 
  | 'time_decay'
  | 'position_based';

export interface EmailTouchpoint {
  campaignId?: string;
  workflowId?: string;
  eventType: EmailEventType;
  timestamp: string;
  attributionWeight: number;
}

// ============================================
// EMAIL BUILDER TYPES
// ============================================

export interface EmailBuilderData {
  version: string;
  blocks: EmailBlock[];
  globalStyles: GlobalStyles;
  preheader?: string;
}

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  position: number;
  config: EmailBlockConfig;
  styles: EmailBlockStyles;
  responsive?: ResponsiveConfig;
}

export type EmailBlockType = 
  | 'header' 
  | 'text' 
  | 'image' 
  | 'button'
  | 'divider' 
  | 'spacer' 
  | 'social' 
  | 'footer'
  | 'product' 
  | 'hero' 
  | 'columns'
  | 'video'
  | 'countdown'
  | 'survey';

export interface EmailBlockConfig {
  // Text block
  content?: string;
  
  // Image block
  src?: string;
  alt?: string;
  href?: string;
  
  // Button block
  text?: string;
  url?: string;
  target?: '_blank' | '_self';
  
  // Social block
  platforms?: SocialPlatform[];
  
  // Product block
  productId?: string;
  showPrice?: boolean;
  showDescription?: boolean;
  
  // Columns block
  columns?: EmailBlock[][];
  columnRatios?: number[];
  
  // Video block
  videoUrl?: string;
  thumbnailUrl?: string;
  
  // Countdown block
  targetDate?: string;
  timezone?: string;
  
  // Survey block
  surveyId?: string;
  questions?: SurveyQuestion[];
}

export interface SocialPlatform {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
  icon?: string;
}

export interface SurveyQuestion {
  id: string;
  type: 'text' | 'choice' | 'rating' | 'scale';
  question: string;
  required: boolean;
  options?: string[];
}

export interface EmailBlockStyles {
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  width?: string;
  height?: string;
}

export interface ResponsiveConfig {
  mobile?: Partial<EmailBlockStyles>;
  tablet?: Partial<EmailBlockStyles>;
}

export interface GlobalStyles {
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  color: string;
  linkColor: string;
  containerWidth: string;
  containerPadding: string;
}

// ============================================
// n8n INTEGRATION TYPES
// ============================================

export interface N8nWebhook {
  id: string;
  agencyId: string;
  webhookName: string;
  webhookUrl: string;
  webhookSecret?: string;
  
  // Trigger configuration
  triggerEvents: string[];
  eventFilters?: Record<string, any>;
  
  // Status
  isActive: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
  
  // Rate limiting
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface N8nWebhookEvent {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  responseStatus?: number;
  responseBody?: string;
  processingTimeMs?: number;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface EmailMarketingApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CampaignListResponse {
  campaigns: EmailCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscriberListResponse {
  subscribers: EmailSubscriber[];
  total: number;
  page: number;
  limit: number;
}

export interface AnalyticsResponse {
  analytics: EmailAnalytics;
  trends: AnalyticsTrend[];
  comparisons?: AnalyticsComparison[];
}

export interface AnalyticsTrend {
  date: string;
  metric: string;
  value: number;
  change: number;
  changePercentage: number;
}

export interface AnalyticsComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateCampaignForm {
  name: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  templateId?: string;
  listIds: string[];
  campaignType: CampaignType;
  sendImmediately: boolean;
  sendTime?: string;
  timezone: string;
  tags: string[];
  notes?: string;
}

export interface CreateListForm {
  name: string;
  description?: string;
  listType: ListType;
  doubleOptIn: boolean;
  welcomeEmailTemplateId?: string;
  segmentRules?: SegmentRule[];
  tags: string[];
}

export interface CreateWorkflowForm {
  name: string;
  description?: string;
  workflowType: WorkflowType;
  triggerType: TriggerType;
  triggerConfig: WorkflowTriggerConfig;
  steps: WorkflowStep[];
}

export interface ImportSubscribersForm {
  listId: string;
  csvData: string;
  fieldMapping: Record<string, string>;
  updateExisting: boolean;
  tags: string[];
}

// ============================================
// STORE TYPES
// ============================================

export interface EmailMarketingState {
  // Campaigns
  campaigns: EmailCampaign[];
  selectedCampaign: EmailCampaign | null;
  campaignAnalytics: Record<string, EmailAnalytics>;
  
  // Subscribers & Lists
  subscribers: EmailSubscriber[];
  lists: EmailList[];
  selectedList: EmailList | null;
  
  // Templates
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  
  // Workflows
  workflows: EmailWorkflow[];
  selectedWorkflow: EmailWorkflow | null;
  
  // Analytics
  overallAnalytics: EmailAnalytics | null;
  revenueAttribution: RevenueAttribution[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
  
  // Builder state
  builderData: EmailBuilderData | null;
  isBuilderOpen: boolean;
  
  // Preview state
  previewMode: 'desktop' | 'mobile' | 'tablet';
  previewData: Record<string, any>;
}

// Export all types
export * from './emailMarketing';