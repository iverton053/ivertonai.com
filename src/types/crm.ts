export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: 'website' | 'referral' | 'cold_outreach' | 'social_media' | 'advertising' | 'event' | 'other';
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned';
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  last_contact: string;
  lead_score: number;
  lifetime_value: number;
  avatar?: string;
}

export interface Deal {
  id: string;
  contact_id: string;
  title: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  actual_close_date?: string;
  source: string;
  description: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  products: string[];
  notes: DealNote[];
}

export interface DealNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  type: 'note' | 'email' | 'call' | 'meeting' | 'task';
}

export interface Activity {
  id: string;
  contact_id?: string;
  deal_id?: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'proposal_sent' | 'contract_signed';
  title: string;
  description: string;
  created_at: string;
  created_by: string;
  due_date?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  is_default: boolean;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  color: string;
  order: number;
}

export interface CRMAnalytics {
  total_contacts: number;
  total_deals: number;
  total_pipeline_value: number;
  deals_won_this_month: number;
  deals_lost_this_month: number;
  conversion_rate: number;
  average_deal_size: number;
  sales_cycle_length: number;
  top_performing_sources: Array<{ source: string; count: number; value: number }>;
  monthly_revenue: Array<{ month: string; revenue: number; deals: number }>;
  pipeline_by_stage: Array<{ stage: string; count: number; value: number }>;
  lead_score_distribution: Array<{ score_range: string; count: number }>;
  activity_summary: Array<{ type: string; count: number }>;
}

export interface CRMInsights {
  deals_likely_to_close: Deal[];
  deals_at_risk: Deal[];
  top_opportunities: Deal[];
  overdue_activities: Activity[];
  hot_leads: Contact[];
  recommended_actions: Array<{
    type: 'follow_up' | 'schedule_meeting' | 'send_proposal' | 'nurture_lead';
    contact_id?: string;
    deal_id?: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'follow_up' | 'proposal' | 'thank_you' | 'custom';
  variables: string[];
  created_at: string;
}

export interface CRMStats {
  contacts_added_today: number;
  deals_created_today: number;
  activities_completed_today: number;
  revenue_this_month: number;
  deals_closed_this_week: number;
  pipeline_velocity: number;
  lead_response_time: number;
  customer_acquisition_cost: number;
}