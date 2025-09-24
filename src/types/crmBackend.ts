// Enhanced CRM Types for Backend Integration

export interface CRMContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'customer' | 'inactive';
  source: 'website' | 'referral' | 'cold-call' | 'social-media' | 'advertisement' | 'other';
  lead_score: number; // 0-100
  tags: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  social_profiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  custom_fields?: Record<string, any>;
  assigned_to?: string; // User ID
  created_at: string;
  updated_at: string;
  last_contacted?: string;
  next_follow_up?: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  contact_id: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number; // 0-100
  expected_close_date?: string;
  actual_close_date?: string;
  deal_source: 'inbound' | 'outbound' | 'referral' | 'partner' | 'other';
  products_services?: string[];
  notes?: string;
  assigned_to?: string; // User ID
  created_at: string;
  updated_at: string;
  stage_history: DealStageHistory[];
}

export interface DealStageHistory {
  id: string;
  deal_id: string;
  from_stage?: string;
  to_stage: string;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo' | 'proposal';
  title: string;
  description?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_to?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  duration_minutes?: number;
  outcome?: 'positive' | 'negative' | 'neutral';
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CRMNote {
  id: string;
  contact_id?: string;
  deal_id?: string;
  activity_id?: string;
  content: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CRMPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

export interface CRMAnalytics {
  total_contacts: number;
  total_deals: number;
  total_deal_value: number;
  won_deals: number;
  lost_deals: number;
  win_rate: number;
  avg_deal_size: number;
  avg_sales_cycle: number; // days
  conversion_by_stage: Record<string, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    deals_count: number;
  }>;
  top_performers: Array<{
    user_id: string;
    deals_won: number;
    revenue: number;
  }>;
  lead_sources: Record<string, number>;
  activity_summary: {
    calls: number;
    emails: number;
    meetings: number;
    tasks: number;
  };
}

export interface CRMDashboardStats {
  contacts_count: number;
  deals_count: number;
  total_pipeline_value: number;
  monthly_revenue: number;
  activities_due_today: number;
  hot_leads: number;
  conversion_rate: number;
  avg_deal_size: number;
}

// API Request/Response Types
export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: CRMContact['status'];
  source?: CRMContact['source'];
  tags?: string[];
  assigned_to?: string;
  custom_fields?: Record<string, any>;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  lead_score?: number;
  last_contacted?: string;
  next_follow_up?: string;
}

export interface CreateDealRequest {
  title: string;
  contact_id: string;
  value: number;
  currency?: string;
  stage?: CRMDeal['stage'];
  probability?: number;
  expected_close_date?: string;
  deal_source?: CRMDeal['deal_source'];
  products_services?: string[];
  notes?: string;
  assigned_to?: string;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {
  actual_close_date?: string;
}

export interface CreateActivityRequest {
  type: CRMActivity['type'];
  title: string;
  description?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_to?: string;
  due_date?: string;
  duration_minutes?: number;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  completed?: boolean;
  completed_at?: string;
  outcome?: CRMActivity['outcome'];
}

// Filter Types
export interface ContactFilters {
  status?: CRMContact['status'];
  source?: CRMContact['source'];
  assigned_to?: string;
  tags?: string[];
  company?: string;
  lead_score_min?: number;
  lead_score_max?: number;
  created_after?: string;
  created_before?: string;
  search?: string; // Search in name, email, company
  limit?: number;
  offset?: number;
}

export interface DealFilters {
  stage?: CRMDeal['stage'];
  assigned_to?: string;
  contact_id?: string;
  value_min?: number;
  value_max?: number;
  expected_close_after?: string;
  expected_close_before?: string;
  deal_source?: CRMDeal['deal_source'];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityFilters {
  type?: CRMActivity['type'];
  assigned_to?: string;
  contact_id?: string;
  deal_id?: string;
  completed?: boolean;
  due_date_after?: string;
  due_date_before?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Response Types
export interface CRMResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface CRMError {
  success: false;
  error: string;
  details?: Record<string, any>;
}

// Webhook Types
export interface CRMWebhookPayload {
  event: 'contact.created' | 'contact.updated' | 'deal.created' | 'deal.updated' | 'activity.completed';
  data: CRMContact | CRMDeal | CRMActivity;
  timestamp: string;
  user_id?: string;
}

export type CRMApiResponse<T> = CRMResponse<T> | CRMError;