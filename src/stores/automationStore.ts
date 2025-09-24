import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  AutomationWorkflow, 
  WorkflowTemplate, 
  WorkflowExecution, 
  WorkflowAnalytics,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowExecutionRequest
} from '../types/automation';

interface AutomationStore {
  // State
  workflows: AutomationWorkflow[];
  templates: WorkflowTemplate[];
  executions: WorkflowExecution[];
  analytics: WorkflowAnalytics | null;
  isLoading: boolean;
  error: string | null;
  selectedWorkflow: AutomationWorkflow | null;
  
  // Actions
  setWorkflows: (workflows: AutomationWorkflow[]) => void;
  setTemplates: (templates: WorkflowTemplate[]) => void;
  setExecutions: (executions: WorkflowExecution[]) => void;
  setAnalytics: (analytics: WorkflowAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedWorkflow: (workflow: AutomationWorkflow | null) => void;
  
  // Workflow Management
  createWorkflow: (request: CreateWorkflowRequest) => Promise<AutomationWorkflow>;
  updateWorkflow: (id: string, request: UpdateWorkflowRequest) => Promise<AutomationWorkflow>;
  deleteWorkflow: (id: string) => Promise<void>;
  executeWorkflow: (request: WorkflowExecutionRequest) => Promise<WorkflowExecution>;
  duplicateWorkflow: (id: string) => Promise<AutomationWorkflow>;
  
  // Template Management  
  useTemplate: (templateId: string) => Promise<AutomationWorkflow>;
  
  // Analytics
  fetchAnalytics: (timeRange: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// Mock data for development
const MOCK_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: 'workflow_1',
    name: 'Welcome Email Sequence',
    description: 'Automatically send welcome emails to new contacts',
    status: 'active',
    trigger: 'contact_created',
    category: 'email',
    steps: [],
    variables: {},
    settings: {
      timeout: 300,
      retry_count: 3,
      retry_delay: 5,
      error_handling: 'notify'
    },
    execution_count: 1247,
    success_rate: 96.8,
    last_execution: '2025-01-09T14:23:00Z',
    average_duration: 34.2,
    total_time_saved: 52.3,
    created_by: 'user_123',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2025-01-09T10:00:00Z',
    tags: ['welcome', 'email', 'onboarding'],
    n8n_workflow_id: 'n8n_001',
    n8n_compatible: true
  },
  {
    id: 'workflow_2',
    name: 'Lead Scoring Update',
    description: 'Automatically update lead scores based on activity',
    status: 'active',
    trigger: 'contact_updated',
    category: 'crm',
    steps: [],
    variables: {},
    settings: {
      timeout: 180,
      retry_count: 2,
      retry_delay: 3,
      error_handling: 'continue'
    },
    execution_count: 734,
    success_rate: 92.4,
    last_execution: '2025-01-09T13:45:00Z',
    average_duration: 67.8,
    total_time_saved: 31.7,
    created_by: 'user_123',
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2025-01-09T09:30:00Z',
    tags: ['lead-scoring', 'crm', 'automation'],
    n8n_workflow_id: 'n8n_002',
    n8n_compatible: true
  },
  {
    id: 'workflow_3', 
    name: 'Social Media Cross-Post',
    description: 'Cross-post content to multiple social platforms',
    status: 'active',
    trigger: 'manual',
    category: 'social',
    steps: [],
    variables: {},
    settings: {
      timeout: 120,
      retry_count: 1,
      retry_delay: 2,
      error_handling: 'stop'
    },
    execution_count: 892,
    success_rate: 98.1,
    last_execution: '2025-01-09T12:15:00Z',
    average_duration: 12.1,
    total_time_saved: 44.6,
    created_by: 'user_123',
    created_at: '2024-12-10T00:00:00Z',
    updated_at: '2025-01-09T08:20:00Z',
    tags: ['social', 'cross-posting', 'multi-platform'],
    n8n_workflow_id: 'n8n_003',
    n8n_compatible: true
  },
  {
    id: 'workflow_4',
    name: 'Invoice Follow-up',
    description: 'Automated payment reminders for overdue invoices',
    status: 'paused',
    trigger: 'schedule',
    category: 'mixed',
    steps: [],
    variables: {},
    settings: {
      timeout: 240,
      retry_count: 3,
      retry_delay: 10,
      error_handling: 'notify'
    },
    execution_count: 456,
    success_rate: 89.3,
    last_execution: '2025-01-08T16:30:00Z',
    average_duration: 89.4,
    total_time_saved: 28.9,
    created_by: 'user_123',
    created_at: '2024-10-20T00:00:00Z',
    updated_at: '2025-01-08T14:10:00Z',
    tags: ['invoicing', 'payments', 'reminders'],
    n8n_workflow_id: 'n8n_004',
    n8n_compatible: true
  },
  {
    id: 'workflow_5',
    name: 'Ad Budget Optimizer',
    description: 'Automatically optimize ad campaign budgets based on performance',
    status: 'active',
    trigger: 'schedule',
    category: 'ads',
    steps: [],
    variables: {},
    settings: {
      timeout: 600,
      retry_count: 5,
      retry_delay: 15,
      error_handling: 'continue'
    },
    execution_count: 203,
    success_rate: 94.6,
    last_execution: '2025-01-09T11:00:00Z',
    average_duration: 156.7,
    total_time_saved: 67.2,
    created_by: 'user_123',
    created_at: '2024-11-05T00:00:00Z',
    updated_at: '2025-01-09T07:45:00Z',
    tags: ['ads', 'optimization', 'budget', 'roi'],
    n8n_workflow_id: 'n8n_005',
    n8n_compatible: true
  }
];

const MOCK_EXECUTIONS: WorkflowExecution[] = [
  {
    id: 'exec_1',
    workflow_id: 'workflow_1',
    workflow_name: 'Welcome Email Sequence',
    status: 'completed',
    started_at: '2025-01-09T14:23:00Z',
    completed_at: '2025-01-09T14:23:34Z',
    duration: 34.2,
    step_executions: [],
    trigger_data: { contact_id: 'contact_123' },
    actions_completed: 3,
    actions_failed: 0,
    data_processed: {},
    retry_count: 0,
    execution_context: {
      user_id: 'user_123',
      client_id: 'client_456',
      source: 'triggered'
    }
  },
  {
    id: 'exec_2',
    workflow_id: 'workflow_2',
    workflow_name: 'Social Media Cross-Post',
    status: 'completed',
    started_at: '2025-01-09T14:18:00Z',
    completed_at: '2025-01-09T14:18:12Z',
    duration: 12.1,
    step_executions: [],
    trigger_data: { post_content: 'New product announcement!' },
    actions_completed: 4,
    actions_failed: 0,
    data_processed: {},
    retry_count: 0,
    execution_context: {
      user_id: 'user_123',
      source: 'manual'
    }
  },
  {
    id: 'exec_3',
    workflow_id: 'workflow_4',
    workflow_name: 'Invoice Follow-up',
    status: 'failed',
    started_at: '2025-01-09T14:15:00Z',
    completed_at: '2025-01-09T14:16:08Z',
    duration: 67.8,
    step_executions: [],
    trigger_data: { invoice_id: 'inv_789' },
    actions_completed: 1,
    actions_failed: 1,
    data_processed: {},
    error_message: 'Email delivery timeout',
    retry_count: 2,
    execution_context: {
      user_id: 'user_123',
      source: 'scheduled'
    }
  }
];

export const useAutomationStore = create<AutomationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        workflows: MOCK_WORKFLOWS,
        templates: [],
        executions: MOCK_EXECUTIONS,
        analytics: null,
        isLoading: false,
        error: null,
        selectedWorkflow: null,

        // State setters
        setWorkflows: (workflows) => set({ workflows }),
        setTemplates: (templates) => set({ templates }),
        setExecutions: (executions) => set({ executions }),
        setAnalytics: (analytics) => set({ analytics }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setSelectedWorkflow: (selectedWorkflow) => set({ selectedWorkflow }),

        // Workflow Management
        createWorkflow: async (request: CreateWorkflowRequest) => {
          set({ isLoading: true, error: null });
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newWorkflow: AutomationWorkflow = {
              id: `workflow_${Date.now()}`,
              ...request,
              status: 'draft',
              execution_count: 0,
              success_rate: 0,
              created_by: 'current_user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              variables: request.steps?.reduce((vars, step) => ({ ...vars, ...step }), {}) || {},
              settings: {
                timeout: 300,
                retry_count: 3,
                retry_delay: 5,
                error_handling: 'notify',
                ...request.settings
              },
              n8n_compatible: true
            };

            const { workflows } = get();
            set({ workflows: [...workflows, newWorkflow], isLoading: false });
            
            return newWorkflow;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create workflow',
              isLoading: false 
            });
            throw error;
          }
        },

        updateWorkflow: async (id: string, request: UpdateWorkflowRequest) => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const { workflows } = get();
            const updatedWorkflows = workflows.map(workflow => 
              workflow.id === id 
                ? { 
                    ...workflow, 
                    ...request,
                    updated_at: new Date().toISOString()
                  }
                : workflow
            );
            
            const updatedWorkflow = updatedWorkflows.find(w => w.id === id);
            if (!updatedWorkflow) {
              throw new Error('Workflow not found');
            }

            set({ workflows: updatedWorkflows, isLoading: false });
            return updatedWorkflow;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update workflow',
              isLoading: false 
            });
            throw error;
          }
        },

        deleteWorkflow: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { workflows } = get();
            const filteredWorkflows = workflows.filter(w => w.id !== id);
            
            set({ 
              workflows: filteredWorkflows,
              selectedWorkflow: get().selectedWorkflow?.id === id ? null : get().selectedWorkflow,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete workflow',
              isLoading: false 
            });
            throw error;
          }
        },

        executeWorkflow: async (request: WorkflowExecutionRequest) => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const { workflows } = get();
            const workflow = workflows.find(w => w.id === request.workflow_id);
            if (!workflow) {
              throw new Error('Workflow not found');
            }

            const execution: WorkflowExecution = {
              id: `exec_${Date.now()}`,
              workflow_id: request.workflow_id,
              workflow_name: workflow.name,
              status: Math.random() > 0.1 ? 'completed' : 'failed',
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              duration: Math.random() * 120 + 10,
              step_executions: [],
              trigger_data: request.trigger_data || {},
              actions_completed: Math.floor(Math.random() * 5) + 1,
              actions_failed: Math.random() > 0.9 ? 1 : 0,
              data_processed: {},
              retry_count: 0,
              execution_context: {
                ...request.execution_context,
                source: request.execution_context?.source || 'manual'
              }
            };

            // Update workflow execution count
            const updatedWorkflows = workflows.map(w => 
              w.id === request.workflow_id 
                ? { 
                    ...w, 
                    execution_count: w.execution_count + 1,
                    last_execution: execution.completed_at
                  }
                : w
            );

            const { executions } = get();
            set({ 
              executions: [execution, ...executions],
              workflows: updatedWorkflows,
              isLoading: false 
            });
            
            return execution;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to execute workflow',
              isLoading: false 
            });
            throw error;
          }
        },

        duplicateWorkflow: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const { workflows } = get();
            const originalWorkflow = workflows.find(w => w.id === id);
            if (!originalWorkflow) {
              throw new Error('Workflow not found');
            }

            const duplicatedWorkflow: AutomationWorkflow = {
              ...originalWorkflow,
              id: `workflow_${Date.now()}`,
              name: `${originalWorkflow.name} (Copy)`,
              status: 'draft',
              execution_count: 0,
              success_rate: 0,
              last_execution: undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            set({ 
              workflows: [...workflows, duplicatedWorkflow],
              isLoading: false 
            });
            
            return duplicatedWorkflow;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to duplicate workflow',
              isLoading: false 
            });
            throw error;
          }
        },

        useTemplate: async (templateId: string) => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { templates } = get();
            const template = templates.find(t => t.id === templateId);
            if (!template) {
              throw new Error('Template not found');
            }

            const workflowFromTemplate: AutomationWorkflow = {
              id: `workflow_${Date.now()}`,
              name: `${template.name} (From Template)`,
              description: template.description,
              status: 'draft',
              trigger: template.trigger,
              category: template.category,
              steps: template.steps.map((step, index) => ({
                ...step,
                id: `step_${Date.now()}_${index}`
              })),
              variables: template.variables,
              settings: {
                timeout: 300,
                retry_count: 3,
                retry_delay: 5,
                error_handling: 'notify'
              },
              execution_count: 0,
              success_rate: 0,
              created_by: 'current_user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              tags: template.tags,
              n8n_compatible: true
            };

            const { workflows } = get();
            set({ 
              workflows: [...workflows, workflowFromTemplate],
              isLoading: false 
            });
            
            return workflowFromTemplate;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create workflow from template',
              isLoading: false 
            });
            throw error;
          }
        },

        fetchAnalytics: async (timeRange: string) => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock analytics data
            const mockAnalytics: WorkflowAnalytics = {
              total_workflows: get().workflows.length,
              active_workflows: get().workflows.filter(w => w.status === 'active').length,
              executions_today: 156,
              executions_this_week: 892,
              executions_this_month: 3247,
              success_rate: 94.2,
              time_saved_hours: 284.5,
              average_execution_time: 45.3,
              fastest_workflow: { name: 'Social Media Cross-Post', duration: 12.4 },
              slowest_workflow: { name: 'Ad Budget Optimizer', duration: 124.7 },
              most_used_workflows: get().workflows
                .sort((a, b) => b.execution_count - a.execution_count)
                .slice(0, 5)
                .map(w => ({
                  id: w.id,
                  name: w.name,
                  execution_count: w.execution_count,
                  success_rate: w.success_rate
                })),
              most_reliable_workflows: get().workflows
                .sort((a, b) => b.success_rate - a.success_rate)
                .slice(0, 5)
                .map(w => ({
                  id: w.id,
                  name: w.name,
                  success_rate: w.success_rate,
                  execution_count: w.execution_count
                })),
              recent_executions: get().executions.slice(0, 10).map(e => ({
                workflow_id: e.workflow_id,
                workflow_name: e.workflow_name,
                status: e.status === 'completed' ? 'success' : 'failed',
                execution_time: e.started_at,
                duration: e.duration || 0
              })),
              common_errors: [
                {
                  error_type: 'Email delivery timeout',
                  count: 23,
                  affected_workflows: ['Welcome Email Sequence', 'Customer Winback']
                },
                {
                  error_type: 'API rate limit exceeded',
                  count: 18,
                  affected_workflows: ['Lead Scoring Update', 'Social Media Cross-Post']
                }
              ],
              execution_trends: Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const executions = Math.floor(Math.random() * 200) + 100;
                const successes = Math.floor(executions * (0.85 + Math.random() * 0.1));
                return {
                  date: date.toISOString().split('T')[0],
                  executions,
                  successes,
                  failures: executions - successes
                };
              }),
              time_saved_by_category: [
                { category: 'Email Marketing', hours_saved: 98.2, workflows_count: 6 },
                { category: 'CRM Management', hours_saved: 76.4, workflows_count: 5 },
                { category: 'Social Media', hours_saved: 54.3, workflows_count: 4 },
                { category: 'Ad Management', hours_saved: 32.1, workflows_count: 3 },
                { category: 'Financial', hours_saved: 23.5, workflows_count: 6 }
              ]
            };

            set({ analytics: mockAnalytics, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch analytics',
              isLoading: false 
            });
            throw error;
          }
        },

        // Utility functions
        clearError: () => set({ error: null }),
        
        reset: () => set({
          workflows: MOCK_WORKFLOWS,
          templates: [],
          executions: MOCK_EXECUTIONS,
          analytics: null,
          isLoading: false,
          error: null,
          selectedWorkflow: null
        })
      }),
      {
        name: 'automation-storage',
        partialize: (state) => ({
          workflows: state.workflows,
          executions: state.executions
        })
      }
    ),
    { name: 'AutomationStore' }
  )
);