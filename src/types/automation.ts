// ============================================
// AUTOMATION SYSTEM TYPES
// n8n-compatible workflow automation types
// ============================================

export type WorkflowStatus = 'active' | 'paused' | 'draft' | 'error';

export type TriggerType = 
  | 'email_opened'
  | 'email_clicked' 
  | 'contact_created'
  | 'contact_updated'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'social_mention'
  | 'social_engagement'
  | 'form_submitted'
  | 'page_visited'
  | 'schedule'
  | 'webhook'
  | 'manual'
  | 'api_call';

export type ActionType = 
  | 'send_email'
  | 'create_contact'
  | 'update_contact'
  | 'create_deal'
  | 'update_deal'
  | 'post_social'
  | 'send_notification'
  | 'create_task'
  | 'update_lead_score'
  | 'add_to_campaign'
  | 'remove_from_campaign'
  | 'create_invoice'
  | 'pause_ad_campaign'
  | 'adjust_ad_budget'
  | 'api_call'
  | 'conditional'
  | 'delay'
  | 'transform_data';

export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with';

// ============================================
// CORE INTERFACES
// ============================================

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  position: { x: number; y: number };
  
  // Trigger-specific properties
  trigger?: {
    type: TriggerType;
    conditions?: WorkflowCondition[];
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
      time?: string;
      days?: number[];
      cron?: string;
    };
    webhook?: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
    };
  };
  
  // Action-specific properties
  action?: {
    type: ActionType;
    parameters: Record<string, any>;
    service: 'email' | 'crm' | 'social' | 'ads' | 'financial' | 'external';
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: Record<string, any>;
  };
  
  // Condition-specific properties
  condition?: {
    field: string;
    operator: ConditionOperator;
    value: any;
    logical_operator?: 'AND' | 'OR';
  };
  
  // Delay-specific properties
  delay?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  
  // Connections to other steps
  next_steps: string[];
  previous_steps: string[];
  
  // Execution tracking
  execution_count?: number;
  last_executed?: string;
  success_rate?: number;
  average_duration?: number;
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  category: 'email' | 'crm' | 'social' | 'ads' | 'mixed' | 'custom';
  
  // Workflow structure
  steps: WorkflowStep[];
  variables: Record<string, any>;
  
  // Execution settings
  settings: {
    timeout: number;
    retry_count: number;
    retry_delay: number;
    error_handling: 'stop' | 'continue' | 'notify';
    notification_email?: string;
  };
  
  // Analytics
  execution_count: number;
  success_rate: number;
  last_execution?: string;
  average_duration?: number;
  total_time_saved?: number;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  
  // n8n compatibility
  n8n_workflow_id?: string;
  n8n_compatible: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'crm' | 'social' | 'ads' | 'mixed';
  trigger: TriggerType;
  complexity: 'simple' | 'intermediate' | 'advanced';
  estimated_time_saved: number; // hours per month
  
  // Template structure
  steps: Omit<WorkflowStep, 'id' | 'execution_count' | 'last_executed' | 'success_rate'>[];
  variables: Record<string, any>;
  
  // Usage stats
  usage_count: number;
  average_rating: number;
  
  // Requirements
  required_integrations: string[];
  required_permissions: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Execution details
  started_at: string;
  completed_at?: string;
  duration?: number;
  
  // Step execution tracking
  step_executions: {
    step_id: string;
    step_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    started_at?: string;
    completed_at?: string;
    duration?: number;
    input_data?: Record<string, any>;
    output_data?: Record<string, any>;
    error_message?: string;
  }[];
  
  // Trigger data
  trigger_data: Record<string, any>;
  
  // Results
  actions_completed: number;
  actions_failed: number;
  data_processed: Record<string, any>;
  
  // Error handling
  error_message?: string;
  retry_count: number;
  
  // Context
  execution_context: {
    user_id?: string;
    client_id?: string;
    agency_id?: string;
    source: 'manual' | 'scheduled' | 'triggered' | 'api';
  };
}

export interface WorkflowAnalytics {
  // Overview metrics
  total_workflows: number;
  active_workflows: number;
  executions_today: number;
  executions_this_week: number;
  executions_this_month: number;
  success_rate: number;
  time_saved_hours: number;
  
  // Performance metrics
  average_execution_time: number;
  fastest_workflow: {
    name: string;
    duration: number;
  };
  slowest_workflow: {
    name: string;
    duration: number;
  };
  
  // Top performers
  most_used_workflows: {
    id: string;
    name: string;
    execution_count: number;
    success_rate: number;
  }[];
  
  most_reliable_workflows: {
    id: string;
    name: string;
    success_rate: number;
    execution_count: number;
  }[];
  
  // Recent activity
  recent_executions: {
    workflow_id: string;
    workflow_name: string;
    status: 'success' | 'failed';
    execution_time: string;
    duration: number;
  }[];
  
  // Error tracking
  common_errors: {
    error_type: string;
    count: number;
    affected_workflows: string[];
  }[];
  
  // Usage trends
  execution_trends: {
    date: string;
    executions: number;
    successes: number;
    failures: number;
  }[];
  
  // Time saved analysis
  time_saved_by_category: {
    category: string;
    hours_saved: number;
    workflows_count: number;
  }[];
}

// ============================================
// n8n COMPATIBILITY TYPES
// ============================================

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8nConnection {
  node: string;
  type: 'main' | 'ai';
  index: number;
}

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, Record<string, N8nConnection[][]>>;
  active: boolean;
  settings: {
    executionOrder: 'v0' | 'v1';
    saveManualExecutions: boolean;
    callerPolicy: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
  };
  staticData?: Record<string, any>;
  pinData?: Record<string, any>;
  versionId?: string;
  meta?: {
    templateCredsSetupCompleted?: boolean;
  };
}

// ============================================
// API TYPES
// ============================================

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  category: 'email' | 'crm' | 'social' | 'ads' | 'mixed' | 'custom';
  trigger: TriggerType;
  steps: Omit<WorkflowStep, 'id' | 'execution_count' | 'last_executed' | 'success_rate'>[];
  settings?: Partial<AutomationWorkflow['settings']>;
  tags?: string[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  steps?: WorkflowStep[];
  settings?: Partial<AutomationWorkflow['settings']>;
  tags?: string[];
}

export interface WorkflowExecutionRequest {
  workflow_id: string;
  trigger_data?: Record<string, any>;
  execution_context?: {
    user_id?: string;
    client_id?: string;
    agency_id?: string;
    source: 'manual' | 'api';
  };
}

export interface AutomationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  execution_id?: string;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// ============================================
// INTEGRATION TYPES
// ============================================

export interface IntegrationCredentials {
  id: string;
  name: string;
  service: string;
  type: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token';
  credentials: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceConnection {
  service: 'email' | 'crm' | 'social' | 'ads' | 'financial';
  endpoints: {
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    parameters?: Record<string, any>;
    response_format: Record<string, any>;
  }[];
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic_auth';
    credentials_id: string;
  };
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  default_value?: any;
  description?: string;
  required: boolean;
  source?: 'user_input' | 'previous_step' | 'external_api' | 'system';
}