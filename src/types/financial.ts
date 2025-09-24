export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  address?: Address;
  billing_address?: Address;
  payment_terms: PaymentTerms;
  default_currency: string;
  tax_rate?: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentTerms {
  net_days: number; // Net 15, Net 30, etc.
  late_fee_percentage?: number;
  discount_percentage?: number;
  discount_days?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'seo' | 'content' | 'social_media' | 'ppc' | 'analytics' | 'automation' | 'consulting';
  pricing_type: 'fixed' | 'hourly' | 'monthly' | 'project' | 'performance';
  base_price: number;
  currency: string;
  tax_inclusive: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client: Client;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  items: InvoiceItem[];
  payment_terms: PaymentTerms;
  notes?: string;
  internal_notes?: string;
  sent_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  service_id: string;
  service: Service;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  tax_rate: number;
  discount_percentage?: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'check' | 'cash';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  client: Client;
  service_id: string;
  service: Service;
  plan_name: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  next_billing_date: string;
  last_billing_date?: string;
  trial_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueMetrics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  average_revenue_per_client: number;
  client_lifetime_value: number;
  churn_rate: number;
  growth_rate: number;
  outstanding_invoices: number;
  overdue_amount: number;
  profit_margin: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface ClientRevenueBreakdown {
  client_id: string;
  client_name: string;
  total_revenue: number;
  monthly_revenue: number;
  outstanding_amount: number;
  last_payment_date?: string;
  services: {
    service_name: string;
    revenue: number;
    invoices_count: number;
  }[];
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'revenue' | 'profit_loss' | 'client_aging' | 'service_performance' | 'tax_summary';
  period: {
    start_date: string;
    end_date: string;
  };
  filters?: ReportFilters;
  data: any;
  generated_at: string;
  generated_by: string;
}

export interface ReportFilters {
  client_ids?: string[];
  service_ids?: string[];
  status?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface TaxSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  total_revenue: number;
  total_tax_collected: number;
  tax_breakdown: {
    rate: number;
    amount: number;
    invoices_count: number;
  }[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  tax_deductible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  receipt_url?: string;
  vendor?: string;
  payment_method: string;
  tax_deductible: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  revenue: {
    this_month: number;
    last_month: number;
    growth_rate: number;
  };
  expenses: {
    this_month: number;
    last_month: number;
    change_rate: number;
  };
  profit: {
    this_month: number;
    last_month: number;
    margin: number;
  };
  outstanding: {
    amount: number;
    invoices_count: number;
    overdue_count: number;
  };
  clients: {
    active_count: number;
    new_this_month: number;
    churn_count: number;
  };
}

// Project Management Types
export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  client: Client;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  budget_type: 'fixed' | 'time_and_materials' | 'monthly_retainer';
  currency: string;
  start_date: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  team_members: string[]; // user IDs
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  project_id: string;
  project: Project;
  user_id: string;
  user_name: string;
  task_description: string;
  hours: number;
  billable: boolean;
  billable_rate?: number;
  entry_date: string;
  start_time?: string;
  end_time?: string;
  is_running: boolean;
  invoice_id?: string; // If already invoiced
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingSession {
  id: string;
  project_id: string;
  user_id: string;
  task_description: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
}

// Project Analytics
export interface ProjectAnalytics {
  project_id: string;
  project_name: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  total_cost: number;
  billable_amount: number;
  invoiced_amount: number;
  outstanding_amount: number;
  profit_margin: number;
  team_utilization: {
    user_id: string;
    user_name: string;
    hours_logged: number;
    efficiency_rating: number;
  }[];
  budget_utilization: {
    budget_used: number;
    budget_remaining: number;
    percentage_used: number;
    on_track: boolean;
  };
}

// Enhanced Financial Dashboard Data
export interface FinancialDashboardData {
  summary: FinancialSummary;
  recent_invoices: Invoice[];
  overdue_invoices: Invoice[];
  active_projects: Project[];
  recent_time_entries: TimeEntry[];
  project_profitability: ProjectAnalytics[];
  revenue_chart_data: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  client_revenue_breakdown: ClientRevenueBreakdown[];
}

// Project Profitability Report
export interface ProjectProfitabilityReport {
  projects: {
    id: string;
    name: string;
    client_name: string;
    budget: number;
    actual_cost: number;
    revenue: number;
    profit: number;
    profit_margin: number;
    hours_logged: number;
    completion_percentage: number;
    status: Project['status'];
  }[];
  summary: {
    total_projects: number;
    profitable_projects: number;
    total_revenue: number;
    total_cost: number;
    average_profit_margin: number;
  };
}