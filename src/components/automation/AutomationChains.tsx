import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  Users,
  Share2,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  Play,
  Pause,
  Settings,
  Copy,
  Download,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Calendar,
  Bell
} from 'lucide-react';

interface ChainStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  platform: string;
  action: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  apiCost: number;
  executionTime: number;
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
  delay?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

interface AutomationChain {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'paused' | 'draft';
  steps: ChainStep[];
  totalCost: number;
  estimatedTime: number;
  successRate: number;
  executionCount: number;
  timeSavedPerExecution: number;
  createdAt: string;
  lastExecuted?: string;
}

interface AutomationChainsProps {
  onChainSelect: (chain: AutomationChain) => void;
  onChainEdit: (chain: AutomationChain) => void;
  onChainDuplicate: (chain: AutomationChain) => void;
  onChainDelete: (chainId: string) => void;
}

// Pre-built automation chains based on the reference file
const AUTOMATION_CHAINS: AutomationChain[] = [
  {
    id: 'email_social_crm_nurture',
    name: 'Email → Social → CRM Lead Nurture',
    description: 'Complete lead nurturing sequence from email engagement to social follow-up and CRM scoring',
    category: 'lead_nurturing',
    status: 'active',
    totalCost: 0.15,
    estimatedTime: 120,
    successRate: 94.2,
    executionCount: 1247,
    timeSavedPerExecution: 45,
    createdAt: '2024-12-01T00:00:00Z',
    lastExecuted: '2025-01-09T14:23:00Z',
    steps: [
      {
        id: 'trigger_email_open',
        type: 'trigger',
        platform: 'SendGrid',
        action: 'Email Opened',
        description: 'Trigger when email is opened by recipient',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0,
        executionTime: 0
      },
      {
        id: 'condition_engagement',
        type: 'condition',
        platform: 'Internal',
        action: 'Check Engagement Score',
        description: 'Check if recipient has high engagement score',
        icon: BarChart3,
        color: 'text-yellow-600',
        apiCost: 0,
        executionTime: 2,
        conditions: [
          { field: 'engagement_score', operator: 'greater_than', value: 70 }
        ]
      },
      {
        id: 'action_social_follow',
        type: 'action',
        platform: 'LinkedIn',
        action: 'Send Connection Request',
        description: 'Send personalized LinkedIn connection request',
        icon: Share2,
        color: 'text-blue-700',
        apiCost: 0.05,
        executionTime: 5
      },
      {
        id: 'delay_wait',
        type: 'delay',
        platform: 'Internal',
        action: 'Wait 2 Days',
        description: 'Wait for connection acceptance',
        icon: Clock,
        color: 'text-gray-400',
        apiCost: 0,
        executionTime: 0,
        delay: { amount: 2, unit: 'days' }
      },
      {
        id: 'action_crm_update',
        type: 'action',
        platform: 'HubSpot',
        action: 'Update Lead Score',
        description: 'Increase lead score and add to nurture sequence',
        icon: Users,
        color: 'text-orange-600',
        apiCost: 0.03,
        executionTime: 3
      },
      {
        id: 'action_social_message',
        type: 'action',
        platform: 'LinkedIn',
        action: 'Send Follow-up Message',
        description: 'Send valuable content via LinkedIn message',
        icon: MessageSquare,
        color: 'text-blue-700',
        apiCost: 0.05,
        executionTime: 2
      },
      {
        id: 'action_email_sequence',
        type: 'action',
        platform: 'SendGrid',
        action: 'Add to Premium Sequence',
        description: 'Add to high-value email nurture sequence',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.02,
        executionTime: 1
      }
    ]
  },
  {
    id: 'ads_crm_email_optimization',
    name: 'Ad Performance → CRM → Email Optimization',
    description: 'Optimize ad campaigns based on CRM conversion data and trigger email sequences',
    category: 'ad_optimization',
    status: 'active',
    totalCost: 0.25,
    estimatedTime: 180,
    successRate: 87.5,
    executionCount: 892,
    timeSavedPerExecution: 60,
    createdAt: '2024-11-15T00:00:00Z',
    lastExecuted: '2025-01-09T13:45:00Z',
    steps: [
      {
        id: 'trigger_ad_conversion',
        type: 'trigger',
        platform: 'Google Ads',
        action: 'Conversion Tracked',
        description: 'Trigger when ad conversion is recorded',
        icon: Target,
        color: 'text-green-600',
        apiCost: 0,
        executionTime: 0
      },
      {
        id: 'action_crm_create',
        type: 'action',
        platform: 'Salesforce',
        action: 'Create Lead',
        description: 'Create new lead in CRM with ad attribution',
        icon: Users,
        color: 'text-orange-600',
        apiCost: 0.08,
        executionTime: 5
      },
      {
        id: 'condition_campaign_performance',
        type: 'condition',
        platform: 'Google Ads',
        action: 'Check Campaign ROI',
        description: 'Check if campaign ROI is above threshold',
        icon: BarChart3,
        color: 'text-yellow-600',
        apiCost: 0.02,
        executionTime: 3,
        conditions: [
          { field: 'roi', operator: 'greater_than', value: 3.0 }
        ]
      },
      {
        id: 'action_ad_budget_increase',
        type: 'action',
        platform: 'Google Ads',
        action: 'Increase Budget 20%',
        description: 'Automatically increase budget for high-performing campaigns',
        icon: DollarSign,
        color: 'text-green-600',
        apiCost: 0.05,
        executionTime: 2
      },
      {
        id: 'action_email_welcome',
        type: 'action',
        platform: 'Mailchimp',
        action: 'Send Welcome Email',
        description: 'Send personalized welcome email based on ad source',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.03,
        executionTime: 2
      },
      {
        id: 'delay_nurture_wait',
        type: 'delay',
        platform: 'Internal',
        action: 'Wait 3 Days',
        description: 'Wait before starting nurture sequence',
        icon: Clock,
        color: 'text-gray-400',
        apiCost: 0,
        executionTime: 0,
        delay: { amount: 3, unit: 'days' }
      },
      {
        id: 'action_email_nurture',
        type: 'action',
        platform: 'Mailchimp',
        action: 'Start Nurture Sequence',
        description: 'Begin automated nurture email sequence',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.07,
        executionTime: 1
      }
    ]
  },
  {
    id: 'social_crm_financial_pipeline',
    name: 'Social Engagement → CRM → Financial Pipeline',
    description: 'Convert social media engagement into sales pipeline and automate invoicing',
    category: 'sales_automation',
    status: 'active',
    totalCost: 0.18,
    estimatedTime: 90,
    successRate: 91.3,
    executionCount: 634,
    timeSavedPerExecution: 75,
    createdAt: '2024-12-05T00:00:00Z',
    lastExecuted: '2025-01-09T12:15:00Z',
    steps: [
      {
        id: 'trigger_social_mention',
        type: 'trigger',
        platform: 'Twitter',
        action: 'Brand Mention',
        description: 'Trigger when brand is mentioned on social media',
        icon: Share2,
        color: 'text-blue-500',
        apiCost: 0,
        executionTime: 0
      },
      {
        id: 'condition_sentiment',
        type: 'condition',
        platform: 'Internal',
        action: 'Sentiment Analysis',
        description: 'Check if mention sentiment is positive',
        icon: BarChart3,
        color: 'text-yellow-600',
        apiCost: 0.01,
        executionTime: 2,
        conditions: [
          { field: 'sentiment_score', operator: 'greater_than', value: 0.7 }
        ]
      },
      {
        id: 'action_crm_opportunity',
        type: 'action',
        platform: 'Pipedrive',
        action: 'Create Opportunity',
        description: 'Create sales opportunity from social engagement',
        icon: Users,
        color: 'text-orange-600',
        apiCost: 0.05,
        executionTime: 4
      },
      {
        id: 'action_social_dm',
        type: 'action',
        platform: 'Twitter',
        action: 'Send Direct Message',
        description: 'Send personalized thank you and service inquiry',
        icon: MessageSquare,
        color: 'text-blue-500',
        apiCost: 0.02,
        executionTime: 3
      },
      {
        id: 'delay_follow_up',
        type: 'delay',
        platform: 'Internal',
        action: 'Wait 1 Day',
        description: 'Wait for potential response',
        icon: Clock,
        color: 'text-gray-400',
        apiCost: 0,
        executionTime: 0,
        delay: { amount: 1, unit: 'days' }
      },
      {
        id: 'action_email_proposal',
        type: 'action',
        platform: 'SendGrid',
        action: 'Send Service Proposal',
        description: 'Send customized service proposal email',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.03,
        executionTime: 2
      },
      {
        id: 'condition_proposal_opened',
        type: 'condition',
        platform: 'SendGrid',
        action: 'Check Email Opened',
        description: 'Check if proposal email was opened',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0,
        executionTime: 1,
        conditions: [
          { field: 'email_opened', operator: 'equals', value: true }
        ]
      },
      {
        id: 'action_crm_hot_lead',
        type: 'action',
        platform: 'Pipedrive',
        action: 'Mark as Hot Lead',
        description: 'Update opportunity status to hot lead',
        icon: TrendingUp,
        color: 'text-red-600',
        apiCost: 0.02,
        executionTime: 1
      },
      {
        id: 'action_financial_quote',
        type: 'action',
        platform: 'QuickBooks',
        action: 'Generate Quote',
        description: 'Create formal quote in financial system',
        icon: DollarSign,
        color: 'text-green-600',
        apiCost: 0.05,
        executionTime: 3
      }
    ]
  },
  {
    id: 'email_crm_support_escalation',
    name: 'Email Support → CRM → Escalation Chain',
    description: 'Automated customer support escalation with CRM integration and team notifications',
    category: 'customer_support',
    status: 'active',
    totalCost: 0.12,
    estimatedTime: 45,
    successRate: 96.8,
    executionCount: 1583,
    timeSavedPerExecution: 30,
    createdAt: '2024-10-20T00:00:00Z',
    lastExecuted: '2025-01-09T15:30:00Z',
    steps: [
      {
        id: 'trigger_support_email',
        type: 'trigger',
        platform: 'Gmail',
        action: 'Support Email Received',
        description: 'Trigger when email is sent to support address',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0,
        executionTime: 0
      },
      {
        id: 'condition_priority',
        type: 'condition',
        platform: 'Internal',
        action: 'Analyze Priority',
        description: 'Analyze email content for priority keywords',
        icon: AlertCircle,
        color: 'text-yellow-600',
        apiCost: 0.01,
        executionTime: 2,
        conditions: [
          { field: 'contains_urgent_keywords', operator: 'equals', value: true }
        ]
      },
      {
        id: 'action_crm_ticket',
        type: 'action',
        platform: 'HubSpot',
        action: 'Create Support Ticket',
        description: 'Create high-priority support ticket in CRM',
        icon: Users,
        color: 'text-orange-600',
        apiCost: 0.03,
        executionTime: 3
      },
      {
        id: 'action_slack_notify',
        type: 'action',
        platform: 'Slack',
        action: 'Notify Support Team',
        description: 'Send immediate notification to support team',
        icon: Bell,
        color: 'text-purple-600',
        apiCost: 0.01,
        executionTime: 1
      },
      {
        id: 'action_email_acknowledge',
        type: 'action',
        platform: 'SendGrid',
        action: 'Send Acknowledgment',
        description: 'Send automatic acknowledgment to customer',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.02,
        executionTime: 2
      },
      {
        id: 'delay_response_time',
        type: 'delay',
        platform: 'Internal',
        action: 'Wait 2 Hours',
        description: 'Wait for support team response',
        icon: Clock,
        color: 'text-gray-400',
        apiCost: 0,
        executionTime: 0,
        delay: { amount: 2, unit: 'hours' }
      },
      {
        id: 'condition_resolved',
        type: 'condition',
        platform: 'HubSpot',
        action: 'Check Ticket Status',
        description: 'Check if ticket has been resolved',
        icon: CheckCircle,
        color: 'text-green-600',
        apiCost: 0.01,
        executionTime: 1,
        conditions: [
          { field: 'ticket_status', operator: 'not_equals', value: 'resolved' }
        ]
      },
      {
        id: 'action_escalate_manager',
        type: 'action',
        platform: 'Slack',
        action: 'Escalate to Manager',
        description: 'Notify support manager of unresolved ticket',
        icon: Bell,
        color: 'text-red-600',
        apiCost: 0.01,
        executionTime: 1
      },
      {
        id: 'action_customer_update',
        type: 'action',
        platform: 'SendGrid',
        action: 'Send Status Update',
        description: 'Send status update to customer',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.02,
        executionTime: 2
      }
    ]
  },
  {
    id: 'financial_crm_email_collections',
    name: 'Invoice Overdue → CRM → Email Collections',
    description: 'Automated invoice collections with CRM updates and escalating communication',
    category: 'financial_automation',
    status: 'active',
    totalCost: 0.14,
    estimatedTime: 60,
    successRate: 89.7,
    executionCount: 445,
    timeSavedPerExecution: 40,
    createdAt: '2024-11-01T00:00:00Z',
    lastExecuted: '2025-01-09T11:45:00Z',
    steps: [
      {
        id: 'trigger_invoice_overdue',
        type: 'trigger',
        platform: 'QuickBooks',
        action: 'Invoice Overdue',
        description: 'Trigger when invoice becomes overdue',
        icon: DollarSign,
        color: 'text-red-600',
        apiCost: 0,
        executionTime: 0
      },
      {
        id: 'action_crm_flag',
        type: 'action',
        platform: 'Salesforce',
        action: 'Flag Account',
        description: 'Add collections flag to customer account',
        icon: Users,
        color: 'text-orange-600',
        apiCost: 0.03,
        executionTime: 2
      },
      {
        id: 'condition_days_overdue',
        type: 'condition',
        platform: 'Internal',
        action: 'Check Days Overdue',
        description: 'Determine collection strategy based on days overdue',
        icon: Calendar,
        color: 'text-yellow-600',
        apiCost: 0,
        executionTime: 1,
        conditions: [
          { field: 'days_overdue', operator: 'less_than', value: 30 }
        ]
      },
      {
        id: 'action_email_gentle',
        type: 'action',
        platform: 'SendGrid',
        action: 'Send Gentle Reminder',
        description: 'Send friendly payment reminder email',
        icon: Mail,
        color: 'text-blue-600',
        apiCost: 0.02,
        executionTime: 2
      },
      {
        id: 'delay_follow_up_wait',
        type: 'delay',
        platform: 'Internal',
        action: 'Wait 7 Days',
        description: 'Wait before escalating',
        icon: Clock,
        color: 'text-gray-400',
        apiCost: 0,
        executionTime: 0,
        delay: { amount: 7, unit: 'days' }
      },
      {
        id: 'condition_still_overdue',
        type: 'condition',
        platform: 'QuickBooks',
        action: 'Check Payment Status',
        description: 'Check if payment has been received',
        icon: DollarSign,
        color: 'text-green-600',
        apiCost: 0.01,
        executionTime: 1,
        conditions: [
          { field: 'payment_received', operator: 'equals', value: false }
        ]
      },
      {
        id: 'action_email_firm',
        type: 'action',
        platform: 'SendGrid',
        action: 'Send Firm Notice',
        description: 'Send firm payment notice with consequences',
        icon: Mail,
        color: 'text-orange-600',
        apiCost: 0.02,
        executionTime: 2
      },
      {
        id: 'action_crm_collections',
        type: 'action',
        platform: 'Salesforce',
        action: 'Assign to Collections',
        description: 'Assign account to collections team',
        icon: Users,
        color: 'text-red-600',
        apiCost: 0.03,
        executionTime: 2
      },
      {
        id: 'action_slack_collections',
        type: 'action',
        platform: 'Slack',
        action: 'Notify Collections Team',
        description: 'Alert collections team of new assignment',
        icon: Bell,
        color: 'text-purple-600',
        apiCost: 0.01,
        executionTime: 1
      }
    ]
  }
];

const AutomationChains: React.FC<AutomationChainsProps> = ({
  onChainSelect,
  onChainEdit,
  onChainDuplicate,
  onChainDelete
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(AUTOMATION_CHAINS.map(chain => chain.category)));
    return ['all', ...cats];
  }, []);

  const filteredChains = useMemo(() => {
    return AUTOMATION_CHAINS.filter(chain => {
      const matchesSearch = chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           chain.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || chain.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || chain.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, statusFilter]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 dark:bg-green-900 text-green-300 dark:text-green-200';
      case 'paused': return 'bg-yellow-900/50 dark:bg-yellow-900 text-yellow-300 dark:text-yellow-200';
      case 'draft': return 'bg-gray-800/50 dark:bg-gray-700 text-gray-300 dark:text-gray-200';
      default: return 'bg-gray-800/50 dark:bg-gray-700 text-gray-300 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      lead_nurturing: 'bg-blue-100 dark:bg-blue-900 text-blue-300 dark:text-blue-200',
      ad_optimization: 'bg-green-900/50 dark:bg-green-900 text-green-300 dark:text-green-200',
      sales_automation: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      customer_support: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      financial_automation: 'bg-red-900/50 dark:bg-red-900 text-red-300 dark:text-red-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-800/50 dark:bg-gray-700 text-gray-300 dark:text-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Cross-Platform Automation Chains
        </h2>
        <p className="text-gray-400">
          Pre-built automation sequences connecting Email → Social → CRM → Financial systems with cost optimization.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search automation chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chains Grid */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredChains.map((chain) => (
            <motion.div
              key={chain.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
            >
              {/* Chain Header */}
              <div className="p-6 border-b border-gray-700 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {chain.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chain.status)}`}>
                        {chain.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(chain.category)}`}>
                        {chain.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-gray-400 dark:text-gray-400 mb-4">
                      {chain.description}
                    </p>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">Total Cost</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(chain.totalCost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">Est. Time</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatTime(chain.estimatedTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">Success Rate</p>
                        <p className="font-semibold text-green-600">
                          {chain.successRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">Executions</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {chain.executionCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">Time Saved</p>
                        <p className="font-semibold text-purple-600">
                          {formatTime(chain.timeSavedPerExecution)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => onChainSelect(chain)}
                      className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Run</span>
                    </button>
                    <button
                      onClick={() => onChainEdit(chain)}
                      className="p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onChainDuplicate(chain)}
                      className="p-2 text-gray-400 dark:text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onChainDelete(chain.id)}
                      className="p-2 text-red-600 hover:bg-red-900/20 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chain Steps Visualization */}
              <div className="p-6">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {chain.steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isLast = index === chain.steps.length - 1;
                    
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex-shrink-0 flex flex-col items-center space-y-2 min-w-[120px]">
                          <div className={`p-3 rounded-lg bg-gray-800/50 dark:bg-gray-700 border-2 ${
                            step.type === 'trigger' ? 'border-green-500' :
                            step.type === 'action' ? 'border-blue-500' :
                            step.type === 'condition' ? 'border-yellow-500' :
                            'border-gray-400'
                          }`}>
                            <StepIcon className={`w-5 h-5 ${step.color}`} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                              {step.action}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                              {step.platform}
                            </p>
                            {step.apiCost > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                {formatCurrency(step.apiCost)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {!isLast && (
                          <div className="flex-shrink-0 flex items-center">
                            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ROI Information */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-700 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 dark:text-gray-400">
                      Created: {new Date(chain.createdAt).toLocaleDateString()}
                    </span>
                    {chain.lastExecuted && (
                      <span className="text-gray-400 dark:text-gray-400">
                        Last run: {new Date(chain.lastExecuted).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-600 font-medium">
                      ROI: {Math.round((chain.timeSavedPerExecution * chain.executionCount) / (chain.totalCost * chain.executionCount) * 100)}%
                    </span>
                    <span className="text-purple-600 font-medium">
                      Total saved: {formatTime(chain.timeSavedPerExecution * chain.executionCount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Automation Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {filteredChains.length}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Available Chains</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(filteredChains.reduce((sum, chain) => sum + chain.totalCost, 0) / filteredChains.length || 0)}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Avg. Cost per Chain</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.round(filteredChains.reduce((sum, chain) => sum + chain.successRate, 0) / filteredChains.length || 0)}%
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Avg. Success Rate</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatTime(filteredChains.reduce((sum, chain) => sum + (chain.timeSavedPerExecution * chain.executionCount), 0))}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Total Time Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationChains;
export { AUTOMATION_CHAINS, type AutomationChain };