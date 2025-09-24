import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Plus,
  Trash2,
  Copy,
  Link,
  ArrowRight,
  Mail,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  BarChart3,
  Zap,
  Clock,
  GitBranch
} from 'lucide-react';
import { WorkflowStep, TriggerType, ActionType, AutomationWorkflow } from '../../types/automation';

interface WorkflowBuilderProps {
  workflow?: AutomationWorkflow;
  onSave: (workflow: Partial<AutomationWorkflow>) => void;
  onExecute: (workflowId: string) => void;
}

const TRIGGER_ICONS = {
  email_opened: Mail,
  email_clicked: Mail,
  contact_created: Users,
  contact_updated: Users,
  deal_stage_changed: DollarSign,
  deal_won: DollarSign,
  deal_lost: DollarSign,
  social_mention: MessageSquare,
  social_engagement: MessageSquare,
  form_submitted: Users,
  page_visited: BarChart3,
  schedule: Clock,
  webhook: Zap,
  manual: Play,
  api_call: Zap
};

const ACTION_ICONS = {
  send_email: Mail,
  create_contact: Users,
  update_contact: Users,
  create_deal: DollarSign,
  update_deal: DollarSign,
  post_social: MessageSquare,
  send_notification: MessageSquare,
  create_task: Calendar,
  update_lead_score: BarChart3,
  add_to_campaign: Mail,
  remove_from_campaign: Mail,
  create_invoice: DollarSign,
  pause_ad_campaign: BarChart3,
  adjust_ad_budget: DollarSign,
  api_call: Zap,
  conditional: GitBranch,
  delay: Clock,
  transform_data: BarChart3
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ 
  workflow, 
  onSave, 
  onExecute 
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showStepPanel, setShowStepPanel] = useState(false);
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [workflowDetails, setWorkflowDetails] = useState({
    name: workflow?.name || 'New Workflow',
    description: workflow?.description || '',
    category: workflow?.category || 'mixed' as const,
    trigger: workflow?.trigger || 'manual' as TriggerType
  });

  const createNewStep = useCallback((type: WorkflowStep['type'], stepType?: TriggerType | ActionType) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 200, y: 200 },
      next_steps: [],
      previous_steps: []
    };

    if (type === 'trigger' && stepType) {
      newStep.trigger = {
        type: stepType as TriggerType,
        conditions: []
      };
      newStep.name = stepType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    if (type === 'action' && stepType) {
      newStep.action = {
        type: stepType as ActionType,
        parameters: {},
        service: 'external'
      };
      newStep.name = stepType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    if (type === 'condition') {
      newStep.condition = {
        field: '',
        operator: 'equals',
        value: ''
      };
    }

    if (type === 'delay') {
      newStep.delay = {
        duration: 1,
        unit: 'hours'
      };
    }

    return newStep;
  }, []);

  const addStep = useCallback((type: WorkflowStep['type'], stepType?: TriggerType | ActionType) => {
    const newStep = createNewStep(type, stepType);
    setSteps(prev => [...prev, newStep]);
    setSelectedStep(newStep);
    setShowStepPanel(true);
  }, [createNewStep]);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    
    if (selectedStep?.id === stepId) {
      setSelectedStep(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedStep]);

  const deleteStep = useCallback((stepId: string) => {
    setSteps(prev => {
      const updatedSteps = prev.filter(step => step.id !== stepId);
      // Clean up connections
      return updatedSteps.map(step => ({
        ...step,
        next_steps: step.next_steps.filter(id => id !== stepId),
        previous_steps: step.previous_steps.filter(id => id !== stepId)
      }));
    });
    
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setShowStepPanel(false);
    }
  }, [selectedStep]);

  const connectSteps = useCallback((fromId: string, toId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === fromId && !step.next_steps.includes(toId)) {
        return { ...step, next_steps: [...step.next_steps, toId] };
      }
      if (step.id === toId && !step.previous_steps.includes(fromId)) {
        return { ...step, previous_steps: [...step.previous_steps, fromId] };
      }
      return step;
    }));
  }, []);

  const handleSaveWorkflow = useCallback(() => {
    const workflowData: Partial<AutomationWorkflow> = {
      ...workflowDetails,
      steps,
      settings: {
        timeout: 300,
        retry_count: 3,
        retry_delay: 5,
        error_handling: 'notify'
      },
      n8n_compatible: true
    };
    
    onSave(workflowData);
  }, [workflowDetails, steps, onSave]);

  const handleExecuteWorkflow = useCallback(async () => {
    if (!workflow?.id) return;
    
    setIsExecuting(true);
    try {
      await onExecute(workflow.id);
    } finally {
      setIsExecuting(false);
    }
  }, [workflow?.id, onExecute]);

  const exportToN8n = useCallback(() => {
    const n8nWorkflow = {
      name: workflowDetails.name,
      nodes: steps.map((step, index) => ({
        id: step.id,
        name: step.name,
        type: step.type === 'trigger' ? 'n8n-nodes-base.trigger' : 
              step.type === 'action' ? 'n8n-nodes-base.function' :
              step.type === 'condition' ? 'n8n-nodes-base.if' :
              'n8n-nodes-base.wait',
        typeVersion: 1,
        position: [step.position.x, step.position.y],
        parameters: step.action?.parameters || step.trigger?.conditions || {}
      })),
      connections: steps.reduce((acc, step) => {
        if (step.next_steps.length > 0) {
          acc[step.id] = {
            main: [step.next_steps.map(nextId => ({ node: nextId, type: 'main', index: 0 }))]
          };
        }
        return acc;
      }, {} as Record<string, any>),
      active: true,
      settings: {
        executionOrder: 'v1' as const,
        saveManualExecutions: false,
        callerPolicy: 'workflowsFromSameOwner' as const
      }
    };

    const blob = new Blob([JSON.stringify(n8nWorkflow, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowDetails.name.replace(/\s+/g, '_').toLowerCase()}_n8n.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [workflowDetails.name, steps]);

  const triggerTypes: TriggerType[] = [
    'email_opened', 'email_clicked', 'contact_created', 'contact_updated',
    'deal_stage_changed', 'deal_won', 'deal_lost', 'social_mention',
    'social_engagement', 'form_submitted', 'page_visited', 'schedule',
    'webhook', 'manual', 'api_call'
  ];

  const actionTypes: ActionType[] = [
    'send_email', 'create_contact', 'update_contact', 'create_deal',
    'update_deal', 'post_social', 'send_notification', 'create_task',
    'update_lead_score', 'add_to_campaign', 'remove_from_campaign',
    'create_invoice', 'pause_ad_campaign', 'adjust_ad_budget', 'api_call',
    'conditional', 'delay', 'transform_data'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-700 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={workflowDetails.name}
              onChange={(e) => setWorkflowDetails(prev => ({ ...prev, name: e.target.value }))}
              className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-300 dark:text-blue-200 rounded-full">
              n8n Compatible
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting || steps.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isExecuting ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isExecuting ? 'Stop' : 'Test Run'}</span>
            </button>
            
            <button
              onClick={handleSaveWorkflow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            <button
              onClick={exportToN8n}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export to n8n</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-700 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Workflow Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Workflow Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={workflowDetails.description}
                    onChange={(e) => setWorkflowDetails(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={workflowDetails.category}
                    onChange={(e) => setWorkflowDetails(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email Marketing</option>
                    <option value="crm">CRM Management</option>
                    <option value="social">Social Media</option>
                    <option value="ads">Ad Campaigns</option>
                    <option value="mixed">Mixed/Cross-platform</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Triggers
              </h3>
              <div className="space-y-2">
                {triggerTypes.map((trigger) => {
                  const Icon = TRIGGER_ICONS[trigger];
                  return (
                    <button
                      key={trigger}
                      onClick={() => addStep('trigger', trigger)}
                      className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                    >
                      <Icon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                {actionTypes.map((action) => {
                  const Icon = ACTION_ICONS[action];
                  return (
                    <button
                      key={action}
                      onClick={() => addStep('action', action)}
                      className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                    >
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logic Elements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Logic & Flow
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => addStep('condition')}
                  className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                >
                  <GitBranch className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-900 dark:text-white">Condition</span>
                </button>
                
                <button
                  onClick={() => addStep('delay')}
                  className="w-full p-3 text-left border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                >
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-900 dark:text-white">Delay</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full bg-gray-50 dark:bg-gray-900 relative"
            style={{
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Steps */}
            {steps.map((step) => {
              const stepType = step.type;
              const Icon = stepType === 'trigger' && step.trigger 
                ? TRIGGER_ICONS[step.trigger.type]
                : stepType === 'action' && step.action
                ? ACTION_ICONS[step.action.type]
                : stepType === 'condition'
                ? GitBranch
                : Clock;

              return (
                <motion.div
                  key={step.id}
                  className={`absolute w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 cursor-pointer transition-all ${
                    selectedStep?.id === step.id 
                      ? 'border-blue-500 shadow-xl' 
                      : 'border-gray-700 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  style={{
                    left: step.position.x,
                    top: step.position.y
                  }}
                  onClick={() => {
                    setSelectedStep(step);
                    setShowStepPanel(true);
                  }}
                  whileHover={{ scale: 1.02, rotate: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ 
                    boxShadow: selectedStep?.id === step.id ? '0 0 20px rgba(59, 130, 246, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        stepType === 'trigger' ? 'bg-green-900/50 dark:bg-green-900' :
                        stepType === 'action' ? 'bg-blue-100 dark:bg-blue-900' :
                        stepType === 'condition' ? 'bg-yellow-900/50 dark:bg-yellow-900' :
                        'bg-orange-100 dark:bg-orange-900'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          stepType === 'trigger' ? 'text-green-600' :
                          stepType === 'action' ? 'text-blue-600' :
                          stepType === 'condition' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {step.name}
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-gray-400 capitalize">
                          {step.type}
                        </p>
                      </div>
                    </div>
                    
                    {step.execution_count !== undefined && (
                      <div className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-700">
                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-400">
                          <span>Executions: {step.execution_count}</span>
                          {step.success_rate !== undefined && (
                            <span>Success: {step.success_rate}%</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Connection points */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-900/200 rounded-full border-2 border-white dark:border-gray-800"></div>
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStep(step.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-900/200 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}

            {/* Connections */}
            {steps.map((step) =>
              step.next_steps.map((nextStepId) => {
                const nextStep = steps.find(s => s.id === nextStepId);
                if (!nextStep) return null;

                const startX = step.position.x + 192; // Width of step + connection point
                const startY = step.position.y + 48; // Half height
                const endX = nextStep.position.x;
                const endY = nextStep.position.y + 48;

                return (
                  <svg
                    key={`${step.id}-${nextStepId}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <path
                      d={`M ${startX} ${startY} Q ${startX + (endX - startX) / 2} ${startY} ${endX} ${endY}`}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#3B82F6"
                        />
                      </marker>
                    </defs>
                  </svg>
                );
              })
            )}

            {/* Empty state */}
            {steps.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Zap className="w-16 h-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Start Building Your Workflow
                  </h3>
                  <p className="text-gray-400 dark:text-gray-400 mb-4">
                    Add triggers and actions from the sidebar to create your automation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step Configuration Panel */}
        <AnimatePresence>
          {showStepPanel && selectedStep && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 bg-white dark:bg-gray-800 border-l border-gray-700 dark:border-gray-700 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Configure Step
                </h3>
                <button
                  onClick={() => setShowStepPanel(false)}
                  className="text-gray-400 hover:text-gray-400 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedStep.type === 'trigger' && selectedStep.trigger && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Trigger Configuration</h4>
                    
                    {selectedStep.trigger.type === 'schedule' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                            Frequency
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom (Cron)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedStep.trigger.type === 'webhook' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                            Webhook URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://api.example.com/webhook"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedStep.type === 'action' && selectedStep.action && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Action Configuration</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                        Service
                      </label>
                      <select 
                        value={selectedStep.action.service}
                        onChange={(e) => updateStep(selectedStep.id, {
                          action: { ...selectedStep.action!, service: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                      >
                        <option value="email">Email</option>
                        <option value="crm">CRM</option>
                        <option value="social">Social Media</option>
                        <option value="ads">Advertising</option>
                        <option value="financial">Financial</option>
                        <option value="external">External API</option>
                      </select>
                    </div>

                    {selectedStep.action.type === 'send_email' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                            Email Template
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md">
                            <option>Welcome Email</option>
                            <option>Follow-up Email</option>
                            <option>Custom Template</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedStep.action.service === 'external' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                            API Endpoint
                          </label>
                          <input
                            type="url"
                            placeholder="https://api.example.com/action"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                            HTTP Method
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md">
                            <option value="POST">POST</option>
                            <option value="GET">GET</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedStep.type === 'condition' && selectedStep.condition && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Condition Configuration</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                        Field
                      </label>
                      <input
                        type="text"
                        value={selectedStep.condition.field}
                        onChange={(e) => updateStep(selectedStep.id, {
                          condition: { ...selectedStep.condition!, field: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., contact.email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                        Operator
                      </label>
                      <select 
                        value={selectedStep.condition.operator}
                        onChange={(e) => updateStep(selectedStep.id, {
                          condition: { ...selectedStep.condition!, operator: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="is_empty">Is Empty</option>
                        <option value="is_not_empty">Is Not Empty</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={selectedStep.condition.value}
                        onChange={(e) => updateStep(selectedStep.id, {
                          condition: { ...selectedStep.condition!, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Comparison value"
                      />
                    </div>
                  </div>
                )}

                {selectedStep.type === 'delay' && selectedStep.delay && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Delay Configuration</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                          Duration
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={selectedStep.delay.duration}
                          onChange={(e) => updateStep(selectedStep.id, {
                            delay: { ...selectedStep.delay!, duration: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-1">
                          Unit
                        </label>
                        <select 
                          value={selectedStep.delay.unit}
                          onChange={(e) => updateStep(selectedStep.id, {
                            delay: { ...selectedStep.delay!, unit: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkflowBuilder;