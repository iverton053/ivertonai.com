import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Mail,
  Users,
  Share2,
  BarChart3,
  DollarSign,
  Calendar,
  Webhook,
  Database,
  Zap,
  MessageSquare,
  Target,
  Globe,
  Code,
  GitBranch,
  Clock,
  Settings,
  Phone,
  FileText,
  CreditCard,
  Briefcase,
  TrendingUp,
  Bell,
  Lock,
  Cloud,
  Smartphone,
  Monitor,
  Layers,
  Package,
  ShoppingCart
} from 'lucide-react';

interface N8nNode {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  type: 'trigger' | 'action' | 'transformation' | 'condition';
  apiCost: 'free' | 'low' | 'medium' | 'high';
  platforms: string[];
  capabilities: string[];
  complexity: 'simple' | 'intermediate' | 'advanced';
  documentation?: string;
  examples?: string[];
}

interface N8nNodeLibraryProps {
  onNodeSelect: (node: N8nNode) => void;
  selectedCategory?: string;
}

const N8N_NODE_LIBRARY: N8nNode[] = [
  // Email Marketing Nodes
  {
    id: 'email_sendgrid',
    name: 'SendGrid',
    category: 'email',
    icon: Mail,
    description: 'Send emails via SendGrid with high deliverability',
    type: 'action',
    apiCost: 'low',
    platforms: ['sendgrid'],
    capabilities: ['send_email', 'templates', 'personalization', 'analytics'],
    complexity: 'simple',
    examples: ['Welcome email sequence', 'Newsletter campaigns', 'Transactional emails']
  },
  {
    id: 'email_mailchimp',
    name: 'Mailchimp',
    category: 'email',
    icon: Mail,
    description: 'Mailchimp email marketing automation',
    type: 'action',
    apiCost: 'low',
    platforms: ['mailchimp'],
    capabilities: ['list_management', 'campaigns', 'automation', 'analytics'],
    complexity: 'intermediate',
    examples: ['Add to audience', 'Create campaign', 'Track engagement']
  },
  {
    id: 'email_opened_trigger',
    name: 'Email Opened',
    category: 'email',
    icon: Mail,
    description: 'Trigger when email is opened by recipient',
    type: 'trigger',
    apiCost: 'free',
    platforms: ['sendgrid', 'mailchimp', 'resend'],
    capabilities: ['event_tracking', 'engagement_data'],
    complexity: 'simple',
    examples: ['Lead scoring update', 'Follow-up sequence', 'Engagement analytics']
  },
  
  // CRM Nodes
  {
    id: 'crm_hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    icon: Users,
    description: 'Manage contacts, deals, and activities in HubSpot',
    type: 'action',
    apiCost: 'medium',
    platforms: ['hubspot'],
    capabilities: ['contact_management', 'deal_tracking', 'activity_logging', 'pipeline_management'],
    complexity: 'intermediate',
    examples: ['Create contact', 'Update deal stage', 'Log activity']
  },
  {
    id: 'crm_salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: Users,
    description: 'Salesforce CRM integration for enterprise sales',
    type: 'action',
    apiCost: 'high',
    platforms: ['salesforce'],
    capabilities: ['lead_management', 'opportunity_tracking', 'account_management', 'reporting'],
    complexity: 'advanced',
    examples: ['Create lead', 'Update opportunity', 'Generate report']
  },
  {
    id: 'crm_contact_created',
    name: 'Contact Created',
    category: 'crm',
    icon: Users,
    description: 'Trigger when new contact is created in CRM',
    type: 'trigger',
    apiCost: 'free',
    platforms: ['hubspot', 'salesforce', 'pipedrive'],
    capabilities: ['contact_data', 'lead_information'],
    complexity: 'simple',
    examples: ['Welcome sequence', 'Lead assignment', 'Scoring update']
  },

  // Social Media Nodes
  {
    id: 'social_facebook',
    name: 'Facebook',
    category: 'social',
    icon: Share2,
    description: 'Post to Facebook pages and manage interactions',
    type: 'action',
    apiCost: 'medium',
    platforms: ['facebook'],
    capabilities: ['post_content', 'page_management', 'engagement_tracking'],
    complexity: 'intermediate',
    examples: ['Schedule posts', 'Cross-platform sharing', 'Engagement tracking']
  },
  {
    id: 'social_linkedin',
    name: 'LinkedIn',
    category: 'social',
    icon: Share2,
    description: 'LinkedIn professional networking automation',
    type: 'action',
    apiCost: 'medium',
    platforms: ['linkedin'],
    capabilities: ['post_content', 'company_pages', 'lead_generation'],
    complexity: 'intermediate',
    examples: ['Company updates', 'Lead nurturing', 'Professional content']
  },
  {
    id: 'social_instagram',
    name: 'Instagram',
    category: 'social',
    icon: Share2,
    description: 'Instagram content posting and story management',
    type: 'action',
    apiCost: 'medium',
    platforms: ['instagram'],
    capabilities: ['post_content', 'story_management', 'hashtag_optimization'],
    complexity: 'intermediate',
    examples: ['Visual content', 'Story campaigns', 'Hashtag strategy']
  },
  {
    id: 'social_mention_trigger',
    name: 'Social Mention',
    category: 'social',
    icon: MessageSquare,
    description: 'Trigger when brand is mentioned on social platforms',
    type: 'trigger',
    apiCost: 'medium',
    platforms: ['twitter', 'facebook', 'linkedin'],
    capabilities: ['brand_monitoring', 'sentiment_analysis'],
    complexity: 'advanced',
    examples: ['Brand monitoring', 'Crisis management', 'Lead generation']
  },

  // Ad Management Nodes
  {
    id: 'ads_google',
    name: 'Google Ads',
    category: 'ads',
    icon: Target,
    description: 'Google Ads campaign management and optimization',
    type: 'action',
    apiCost: 'high',
    platforms: ['google_ads'],
    capabilities: ['campaign_management', 'keyword_bidding', 'performance_tracking'],
    complexity: 'advanced',
    examples: ['Budget optimization', 'Keyword management', 'Performance alerts']
  },
  {
    id: 'ads_facebook',
    name: 'Meta Ads',
    category: 'ads',
    icon: Target,
    description: 'Facebook and Instagram advertising platform',
    type: 'action',
    apiCost: 'high',
    platforms: ['facebook_ads', 'instagram_ads'],
    capabilities: ['audience_targeting', 'creative_management', 'conversion_tracking'],
    complexity: 'advanced',
    examples: ['Audience lookalikes', 'Dynamic ads', 'Conversion optimization']
  },
  {
    id: 'ads_performance_trigger',
    name: 'Ad Performance Alert',
    category: 'ads',
    icon: BarChart3,
    description: 'Trigger based on ad performance thresholds',
    type: 'trigger',
    apiCost: 'free',
    platforms: ['google_ads', 'facebook_ads'],
    capabilities: ['performance_monitoring', 'threshold_alerts'],
    complexity: 'intermediate',
    examples: ['Budget alerts', 'ROI optimization', 'Campaign pausing']
  },

  // Financial Nodes
  {
    id: 'finance_stripe',
    name: 'Stripe',
    category: 'financial',
    icon: CreditCard,
    description: 'Payment processing and subscription management',
    type: 'action',
    apiCost: 'low',
    platforms: ['stripe'],
    capabilities: ['payment_processing', 'subscription_management', 'invoice_creation'],
    complexity: 'intermediate',
    examples: ['Payment notifications', 'Subscription updates', 'Invoice automation']
  },
  {
    id: 'finance_quickbooks',
    name: 'QuickBooks',
    category: 'financial',
    icon: DollarSign,
    description: 'Accounting and financial data synchronization',
    type: 'action',
    apiCost: 'medium',
    platforms: ['quickbooks'],
    capabilities: ['invoice_management', 'expense_tracking', 'financial_reporting'],
    complexity: 'advanced',
    examples: ['Auto-invoicing', 'Expense categorization', 'Financial reports']
  },
  {
    id: 'finance_payment_received',
    name: 'Payment Received',
    category: 'financial',
    icon: DollarSign,
    description: 'Trigger when payment is successfully processed',
    type: 'trigger',
    apiCost: 'free',
    platforms: ['stripe', 'paypal', 'quickbooks'],
    capabilities: ['payment_data', 'customer_information'],
    complexity: 'simple',
    examples: ['Thank you emails', 'Service activation', 'Customer onboarding']
  },

  // Workflow Control Nodes
  {
    id: 'condition_if',
    name: 'IF Condition',
    category: 'logic',
    icon: GitBranch,
    description: 'Branch workflow based on conditions',
    type: 'condition',
    apiCost: 'free',
    platforms: ['internal'],
    capabilities: ['conditional_logic', 'data_comparison', 'workflow_routing'],
    complexity: 'simple',
    examples: ['Lead scoring branches', 'Segmentation logic', 'A/B testing']
  },
  {
    id: 'delay_wait',
    name: 'Wait/Delay',
    category: 'logic',
    icon: Clock,
    description: 'Add delays between workflow steps',
    type: 'transformation',
    apiCost: 'free',
    platforms: ['internal'],
    capabilities: ['time_delays', 'scheduling', 'sequence_timing'],
    complexity: 'simple',
    examples: ['Nurture sequences', 'Follow-up timing', 'Drip campaigns']
  },
  {
    id: 'transform_data',
    name: 'Data Transformation',
    category: 'logic',
    icon: Layers,
    description: 'Transform and manipulate data between steps',
    type: 'transformation',
    apiCost: 'free',
    platforms: ['internal'],
    capabilities: ['data_mapping', 'field_transformation', 'format_conversion'],
    complexity: 'intermediate',
    examples: ['Field mapping', 'Data cleaning', 'Format standardization']
  },

  // Communication Nodes
  {
    id: 'comm_slack',
    name: 'Slack',
    category: 'communication',
    icon: MessageSquare,
    description: 'Send messages and notifications via Slack',
    type: 'action',
    apiCost: 'low',
    platforms: ['slack'],
    capabilities: ['messaging', 'channel_posting', 'notification_alerts'],
    complexity: 'simple',
    examples: ['Team notifications', 'Alert systems', 'Status updates']
  },
  {
    id: 'comm_teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: MessageSquare,
    description: 'Microsoft Teams integration for notifications',
    type: 'action',
    apiCost: 'low',
    platforms: ['teams'],
    capabilities: ['team_messaging', 'channel_notifications', 'file_sharing'],
    complexity: 'simple',
    examples: ['Project updates', 'Alert notifications', 'File automation']
  },
  {
    id: 'comm_sms',
    name: 'SMS/Twilio',
    category: 'communication',
    icon: Phone,
    description: 'Send SMS messages via Twilio',
    type: 'action',
    apiCost: 'medium',
    platforms: ['twilio'],
    capabilities: ['sms_sending', 'phone_verification', 'call_automation'],
    complexity: 'intermediate',
    examples: ['Appointment reminders', 'Verification codes', 'Emergency alerts']
  },

  // Data & Analytics Nodes
  {
    id: 'analytics_google',
    name: 'Google Analytics',
    category: 'analytics',
    icon: BarChart3,
    description: 'Google Analytics data retrieval and reporting',
    type: 'action',
    apiCost: 'free',
    platforms: ['google_analytics'],
    capabilities: ['traffic_data', 'conversion_tracking', 'audience_insights'],
    complexity: 'intermediate',
    examples: ['Traffic reports', 'Conversion tracking', 'Audience analysis']
  },
  {
    id: 'database_postgresql',
    name: 'PostgreSQL',
    category: 'database',
    icon: Database,
    description: 'Connect to PostgreSQL databases',
    type: 'action',
    apiCost: 'free',
    platforms: ['postgresql'],
    capabilities: ['data_storage', 'query_execution', 'data_retrieval'],
    complexity: 'advanced',
    examples: ['Data storage', 'Custom reporting', 'Data synchronization']
  },
  {
    id: 'webhook_generic',
    name: 'Generic Webhook',
    category: 'integration',
    icon: Webhook,
    description: 'Send or receive webhook data from any service',
    type: 'trigger',
    apiCost: 'free',
    platforms: ['any'],
    capabilities: ['webhook_handling', 'custom_integrations', 'real_time_data'],
    complexity: 'advanced',
    examples: ['Custom integrations', 'Real-time triggers', 'API connections']
  }
];

const CATEGORY_ICONS = {
  email: Mail,
  crm: Users,
  social: Share2,
  ads: Target,
  financial: DollarSign,
  logic: GitBranch,
  communication: MessageSquare,
  analytics: BarChart3,
  database: Database,
  integration: Webhook
};

const API_COST_COLORS = {
  free: 'bg-green-900/50 dark:bg-green-900 text-green-300 dark:text-green-200',
  low: 'bg-blue-100 dark:bg-blue-900 text-blue-300 dark:text-blue-200',
  medium: 'bg-yellow-900/50 dark:bg-yellow-900 text-yellow-300 dark:text-yellow-200',
  high: 'bg-red-900/50 dark:bg-red-900 text-red-300 dark:text-red-200'
};

const COMPLEXITY_COLORS = {
  simple: 'bg-green-900/50 dark:bg-green-900 text-green-300 dark:text-green-200',
  intermediate: 'bg-yellow-900/50 dark:bg-yellow-900 text-yellow-300 dark:text-yellow-200',
  advanced: 'bg-red-900/50 dark:bg-red-900 text-red-300 dark:text-red-200'
};

const N8nNodeLibrary: React.FC<N8nNodeLibraryProps> = ({ onNodeSelect, selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategory || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(N8N_NODE_LIBRARY.map(node => node.category)));
    return ['all', ...cats];
  }, []);

  const filteredNodes = useMemo(() => {
    return N8N_NODE_LIBRARY.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           node.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || node.category === categoryFilter;
      const matchesType = typeFilter === 'all' || node.type === typeFilter;
      const matchesCost = costFilter === 'all' || node.apiCost === costFilter;
      const matchesComplexity = complexityFilter === 'all' || node.complexity === complexityFilter;
      
      return matchesSearch && matchesCategory && matchesType && matchesCost && matchesComplexity;
    });
  }, [searchQuery, categoryFilter, typeFilter, costFilter, complexityFilter]);

  const nodesByCategory = useMemo(() => {
    return filteredNodes.reduce((acc, node) => {
      if (!acc[node.category]) {
        acc[node.category] = [];
      }
      acc[node.category].push(node);
      return acc;
    }, {} as Record<string, N8nNode[]>);
  }, [filteredNodes]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          n8n Node Library
        </h2>
        <p className="text-gray-400">
          Comprehensive collection of n8n-compatible automation nodes with API cost tracking.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="trigger">Triggers</option>
              <option value="action">Actions</option>
              <option value="transformation">Transformations</option>
              <option value="condition">Conditions</option>
            </select>
          </div>

          {/* Cost Filter */}
          <div>
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Costs</option>
              <option value="free">Free</option>
              <option value="low">Low Cost</option>
              <option value="medium">Medium Cost</option>
              <option value="high">High Cost</option>
            </select>
          </div>

          {/* Complexity Filter */}
          <div>
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="simple">Simple</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nodes Grid by Category */}
      <div className="space-y-8">
        {Object.entries(nodesByCategory).map(([category, nodes]) => {
          const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Package;
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CategoryIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {category} ({nodes.length})
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-400">
                    {category === 'email' && 'Email marketing and communication automation'}
                    {category === 'crm' && 'Customer relationship management integrations'}
                    {category === 'social' && 'Social media platform automations'}
                    {category === 'ads' && 'Advertising campaign management'}
                    {category === 'financial' && 'Payment and financial data processing'}
                    {category === 'logic' && 'Workflow control and data transformation'}
                    {category === 'communication' && 'Team messaging and notifications'}
                    {category === 'analytics' && 'Data analysis and reporting'}
                    {category === 'database' && 'Data storage and retrieval'}
                    {category === 'integration' && 'Custom integrations and webhooks'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {nodes.map((node) => {
                    const NodeIcon = node.icon;
                    
                    return (
                      <motion.div
                        key={node.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all hover:bg-gray-750"
                        onClick={() => onNodeSelect(node)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800/50 dark:bg-gray-700 rounded-lg">
                              <NodeIcon className="w-5 h-5 text-gray-400 dark:text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">
                                {node.name}
                              </h4>
                              <p className="text-xs text-gray-400 capitalize">
                                {node.type}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {node.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${API_COST_COLORS[node.apiCost]}`}>
                            {node.apiCost} cost
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${COMPLEXITY_COLORS[node.complexity]}`}>
                            {node.complexity}
                          </span>
                        </div>

                        {/* Capabilities */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-300 dark:text-gray-300">
                            Capabilities:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {node.capabilities.slice(0, 3).map((capability) => (
                              <span
                                key={capability}
                                className="px-2 py-1 text-xs bg-blue-900/20 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                              >
                                {capability.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {node.capabilities.length > 3 && (
                              <span className="px-2 py-1 text-xs text-gray-400 dark:text-gray-400">
                                +{node.capabilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Platforms */}
                        {node.platforms.length > 0 && node.platforms[0] !== 'internal' && (
                          <div className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-700">
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                              Platforms: {node.platforms.slice(0, 2).join(', ')}
                              {node.platforms.length > 2 && ` +${node.platforms.length - 2} more`}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNodes.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No nodes found
          </h3>
          <p className="text-gray-400 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setTypeFilter('all');
              setCostFilter('all');
              setComplexityFilter('all');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {filteredNodes.length}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Available Nodes</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {filteredNodes.filter(n => n.apiCost === 'free').length}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Free Nodes</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {categories.length - 1}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Categories</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Array.from(new Set(filteredNodes.flatMap(n => n.platforms))).length}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">Integrations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default N8nNodeLibrary;
export { N8N_NODE_LIBRARY, type N8nNode };