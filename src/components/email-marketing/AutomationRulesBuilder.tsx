import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Settings, Plus, X, Clock, Users, Mail, TrendingUp, Filter, ChevronDown } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'subscriber_action' | 'time_based' | 'engagement' | 'custom_event';
    conditions: any[];
  };
  actions: {
    type: 'send_email' | 'tag_subscriber' | 'move_list' | 'webhook' | 'wait';
    config: any;
  }[];
  status: 'active' | 'inactive' | 'draft';
  created: string;
  lastRun?: string;
  executions: number;
  successRate: number;
}

interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  connections: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const AutomationRulesBuilder: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      name: 'Welcome Series',
      description: 'Send welcome email sequence to new subscribers',
      trigger: {
        type: 'subscriber_action',
        conditions: [{ field: 'subscription_status', operator: 'equals', value: 'subscribed' }]
      },
      actions: [
        { type: 'send_email', config: { templateId: 'welcome-1', delay: 0 } },
        { type: 'wait', config: { duration: 24, unit: 'hours' } },
        { type: 'send_email', config: { templateId: 'welcome-2', delay: 0 } }
      ],
      status: 'active',
      created: '2024-09-20',
      lastRun: '2024-09-24 10:30:00',
      executions: 245,
      successRate: 98.4
    },
    {
      id: '2',
      name: 'Re-engagement Campaign',
      description: 'Target inactive subscribers with special offers',
      trigger: {
        type: 'engagement',
        conditions: [{ field: 'last_opened', operator: 'older_than', value: { duration: 30, unit: 'days' } }]
      },
      actions: [
        { type: 'tag_subscriber', config: { tag: 'inactive' } },
        { type: 'send_email', config: { templateId: 'reengagement', delay: 0 } },
        { type: 'webhook', config: { url: 'https://n8n.webhook.url/reengagement' } }
      ],
      status: 'active',
      created: '2024-09-18',
      lastRun: '2024-09-24 08:15:00',
      executions: 89,
      successRate: 76.4
    },
    {
      id: '3',
      name: 'Purchase Follow-up',
      description: 'Send thank you and review request after purchase',
      trigger: {
        type: 'custom_event',
        conditions: [{ field: 'event_name', operator: 'equals', value: 'purchase_completed' }]
      },
      actions: [
        { type: 'send_email', config: { templateId: 'thank-you', delay: 0 } },
        { type: 'wait', config: { duration: 3, unit: 'days' } },
        { type: 'send_email', config: { templateId: 'review-request', delay: 0 } }
      ],
      status: 'draft',
      created: '2024-09-22',
      executions: 0,
      successRate: 0
    }
  ]);

  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([
    {
      id: 'n8n_email_welcome',
      name: 'Email Welcome Automation',
      description: 'N8N workflow for automated welcome email sequence',
      nodes: [
        { id: 'webhook', type: 'webhook', name: 'Webhook Trigger' },
        { id: 'email', type: 'email', name: 'Send Welcome Email' },
        { id: 'delay', type: 'delay', name: 'Wait 24 Hours' },
        { id: 'followup', type: 'email', name: 'Send Follow-up' }
      ],
      connections: {},
      active: true,
      createdAt: '2024-09-15',
      updatedAt: '2024-09-20'
    },
    {
      id: 'n8n_abandoned_cart',
      name: 'Abandoned Cart Recovery',
      description: 'N8N workflow for cart abandonment emails',
      nodes: [
        { id: 'trigger', type: 'webhook', name: 'Cart Abandoned' },
        { id: 'condition', type: 'if', name: 'Check User Status' },
        { id: 'email1', type: 'email', name: 'First Reminder' },
        { id: 'delay1', type: 'delay', name: 'Wait 4 Hours' },
        { id: 'email2', type: 'email', name: 'Second Reminder' }
      ],
      connections: {},
      active: true,
      createdAt: '2024-09-18',
      updatedAt: '2024-09-23'
    }
  ]);

  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedTab, setSelectedTab] = useState<'rules' | 'workflows' | 'templates'>('rules');

  const triggerTypes = [
    { value: 'subscriber_action', label: 'Subscriber Action', icon: Users },
    { value: 'time_based', label: 'Time Based', icon: Clock },
    { value: 'engagement', label: 'Engagement', icon: TrendingUp },
    { value: 'custom_event', label: 'Custom Event', icon: Settings }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'tag_subscriber', label: 'Tag Subscriber', icon: Users },
    { value: 'move_list', label: 'Move to List', icon: Users },
    { value: 'webhook', label: 'Webhook', icon: Settings },
    { value: 'wait', label: 'Wait/Delay', icon: Clock }
  ];

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const duplicateRule = (rule: Rule) => {
    const newRule = {
      ...rule,
      id: `${Date.now()}`,
      name: `${rule.name} (Copy)`,
      status: 'draft' as const,
      created: new Date().toISOString().split('T')[0],
      executions: 0,
      successRate: 0,
      lastRun: undefined
    };
    setRules(prev => [...prev, newRule]);
  };

  const renderRuleCard = (rule: Rule) => (
    <motion.div
      key={rule.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              rule.status === 'active' ? 'bg-green-900 text-green-300' :
              rule.status === 'inactive' ? 'bg-red-900 text-red-300' :
              'bg-yellow-900 text-yellow-300'
            }`}>
              {rule.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{rule.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Executions: {rule.executions}</span>
            <span>Success Rate: {rule.successRate}%</span>
            {rule.lastRun && <span>Last Run: {rule.lastRun}</span>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleRuleStatus(rule.id)}
            className={`p-2 rounded-lg transition-colors ${
              rule.status === 'active'
                ? 'bg-red-900 hover:bg-red-800 text-red-300'
                : 'bg-green-900 hover:bg-green-800 text-green-300'
            }`}
          >
            {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setEditingRule(rule)}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => duplicateRule(rule)}
            className="p-2 bg-blue-900 hover:bg-blue-800 text-blue-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => deleteRule(rule.id)}
            className="p-2 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Trigger</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              {React.createElement(triggerTypes.find(t => t.value === rule.trigger.type)?.icon || Settings, { className: "w-4 h-4" })}
              <span>{triggerTypes.find(t => t.value === rule.trigger.type)?.label}</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Actions ({rule.actions.length})</h4>
            <div className="flex space-x-2">
              {rule.actions.slice(0, 3).map((action, index) => {
                const ActionIcon = actionTypes.find(t => t.value === action.type)?.icon || Settings;
                return (
                  <div key={index} className="p-1 bg-gray-700 rounded">
                    <ActionIcon className="w-3 h-3 text-gray-400" />
                  </div>
                );
              })}
              {rule.actions.length > 3 && (
                <div className="p-1 bg-gray-700 rounded text-xs text-gray-400">
                  +{rule.actions.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderWorkflowCard = (workflow: N8NWorkflow) => (
    <motion.div
      key={workflow.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              workflow.active ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-300'
            }`}>
              {workflow.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{workflow.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Nodes: {workflow.nodes.length}</span>
            <span>Created: {workflow.createdAt}</span>
            <span>Updated: {workflow.updatedAt}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-blue-300 rounded-lg text-sm transition-colors">
            Open in N8N
          </button>
          <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex flex-wrap gap-2">
          {workflow.nodes.map((node, index) => (
            <div key={index} className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
              {node.name}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Automation Rules Builder</h2>
          <p className="text-gray-400 mt-2">Create and manage email automation workflows</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { key: 'rules', label: 'Rules' },
              { key: 'workflows', label: 'N8N Workflows' },
              { key: 'templates', label: 'Templates' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRuleBuilder(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Rules</h3>
            <Play className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {rules.filter(r => r.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">
            {((rules.filter(r => r.status === 'active').length / rules.length) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total Executions</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {rules.reduce((sum, rule) => sum + rule.executions, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">This month</div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Avg Success Rate</h3>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {(rules.reduce((sum, rule) => sum + rule.successRate, 0) / rules.length).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Across all rules</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {selectedTab === 'rules' && (
            <div className="space-y-4">
              {rules.map(renderRuleCard)}
            </div>
          )}

          {selectedTab === 'workflows' && (
            <div className="space-y-4">
              {workflows.map(renderWorkflowCard)}
            </div>
          )}

          {selectedTab === 'templates' && (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Rule Templates</h3>
              <p className="text-gray-400 mb-6">Pre-built automation templates will be available here</p>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                Browse Templates
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showRuleBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRuleBuilder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Rule</h2>
                <button
                  onClick={() => setShowRuleBuilder(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rule Name</label>
                  <input
                    type="text"
                    placeholder="Enter rule name..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what this rule does..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Trigger Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {triggerTypes.map((trigger) => (
                      <button
                        key={trigger.value}
                        className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all text-left"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <trigger.icon className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-white">{trigger.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setShowRuleBuilder(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    Continue Setup
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutomationRulesBuilder;