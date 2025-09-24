import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Star,
  Download,
  Settings,
  ExternalLink,
  Check,
  Clock,
  AlertCircle,
  Zap,
  Globe,
  Database,
  Mail,
  MessageSquare,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  ShoppingBag,
  FileText,
  Phone,
  Video,
  Cloud
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  icon: string;
  rating: number;
  reviews: number;
  installs: number;
  price: {
    type: 'free' | 'paid' | 'freemium';
    amount?: number;
    period?: string;
  };
  status: 'available' | 'installed' | 'installing' | 'error';
  features: string[];
  screenshots: string[];
  documentation: string;
  supportedTriggers: string[];
  supportedActions: string[];
  authType: 'oauth2' | 'api_key' | 'basic_auth' | 'custom';
  isOfficial: boolean;
  lastUpdated: string;
  compatibility: {
    contacts: boolean;
    deals: boolean;
    campaigns: boolean;
    analytics: boolean;
  };
}

const IntegrationsMarketplace: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [filteredIntegrations, setFilteredIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe },
    { id: 'crm', name: 'CRM & Sales', icon: Users },
    { id: 'marketing', name: 'Marketing', icon: BarChart3 },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'productivity', name: 'Productivity', icon: Calendar },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'storage', name: 'Storage', icon: Cloud },
    { id: 'finance', name: 'Finance', icon: DollarSign }
  ];

  useEffect(() => {
    // Mock integrations data
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'HubSpot CRM',
        description: 'Sync contacts, deals, and activities with HubSpot CRM for seamless data flow.',
        category: 'crm',
        provider: 'HubSpot, Inc.',
        icon: '🚀',
        rating: 4.8,
        reviews: 1250,
        installs: 15000,
        price: { type: 'freemium', amount: 45, period: 'month' },
        status: 'available',
        features: ['Contact Sync', 'Deal Pipeline', 'Activity Tracking', 'Custom Fields', 'Webhooks'],
        screenshots: [],
        documentation: 'https://docs.hubspot.com/api',
        supportedTriggers: ['contact_created', 'deal_updated', 'activity_logged'],
        supportedActions: ['create_contact', 'update_deal', 'send_email'],
        authType: 'oauth2',
        isOfficial: true,
        lastUpdated: '2024-01-15',
        compatibility: { contacts: true, deals: true, campaigns: true, analytics: true }
      },
      {
        id: '2',
        name: 'Salesforce',
        description: 'Enterprise-grade CRM integration with advanced workflow automation.',
        category: 'crm',
        provider: 'Salesforce, Inc.',
        icon: '⚡',
        rating: 4.6,
        reviews: 890,
        installs: 8500,
        price: { type: 'paid', amount: 99, period: 'month' },
        status: 'installed',
        features: ['Lead Management', 'Opportunity Tracking', 'Custom Objects', 'Apex Integration'],
        screenshots: [],
        documentation: 'https://developer.salesforce.com/',
        supportedTriggers: ['lead_created', 'opportunity_won', 'case_updated'],
        supportedActions: ['create_lead', 'update_opportunity', 'create_task'],
        authType: 'oauth2',
        isOfficial: true,
        lastUpdated: '2024-01-10',
        compatibility: { contacts: true, deals: true, campaigns: true, analytics: true }
      },
      {
        id: '3',
        name: 'Slack',
        description: 'Get real-time notifications and manage workflows directly from Slack.',
        category: 'communication',
        provider: 'Slack Technologies',
        icon: '💬',
        rating: 4.7,
        reviews: 2100,
        installs: 25000,
        price: { type: 'free' },
        status: 'available',
        features: ['Notifications', 'Bot Commands', 'Channel Updates', 'File Sharing'],
        screenshots: [],
        documentation: 'https://api.slack.com/',
        supportedTriggers: ['message_received', 'reaction_added', 'file_shared'],
        supportedActions: ['send_message', 'create_channel', 'invite_user'],
        authType: 'oauth2',
        isOfficial: true,
        lastUpdated: '2024-01-12',
        compatibility: { contacts: false, deals: true, campaigns: true, analytics: false }
      },
      {
        id: '4',
        name: 'Google Sheets',
        description: 'Export data and create automated reports in Google Sheets.',
        category: 'productivity',
        provider: 'Google LLC',
        icon: '📊',
        rating: 4.5,
        reviews: 1800,
        installs: 18000,
        price: { type: 'free' },
        status: 'available',
        features: ['Data Export', 'Real-time Sync', 'Custom Formulas', 'Charts & Graphs'],
        screenshots: [],
        documentation: 'https://developers.google.com/sheets/api',
        supportedTriggers: ['row_added', 'cell_updated', 'sheet_created'],
        supportedActions: ['add_row', 'update_cell', 'create_sheet'],
        authType: 'oauth2',
        isOfficial: true,
        lastUpdated: '2024-01-08',
        compatibility: { contacts: true, deals: true, campaigns: true, analytics: true }
      },
      {
        id: '5',
        name: 'Mailchimp',
        description: 'Sync your contacts with Mailchimp for email marketing campaigns.',
        category: 'marketing',
        provider: 'Intuit Mailchimp',
        icon: '📧',
        rating: 4.4,
        reviews: 950,
        installs: 12000,
        price: { type: 'freemium', amount: 25, period: 'month' },
        status: 'installing',
        features: ['Audience Sync', 'Campaign Tracking', 'Automation', 'A/B Testing'],
        screenshots: [],
        documentation: 'https://mailchimp.com/developer/',
        supportedTriggers: ['subscriber_added', 'campaign_sent', 'email_opened'],
        supportedActions: ['add_subscriber', 'send_campaign', 'update_audience'],
        authType: 'oauth2',
        isOfficial: true,
        lastUpdated: '2024-01-14',
        compatibility: { contacts: true, deals: false, campaigns: true, analytics: true }
      },
      {
        id: '6',
        name: 'Zapier',
        description: 'Connect with 5000+ apps through Zapier\'s automation platform.',
        category: 'productivity',
        provider: 'Zapier, Inc.',
        icon: '⚡',
        rating: 4.6,
        reviews: 3200,
        installs: 35000,
        price: { type: 'freemium', amount: 20, period: 'month' },
        status: 'available',
        features: ['5000+ App Connections', 'Multi-step Workflows', 'Webhooks', 'Filters & Logic'],
        screenshots: [],
        documentation: 'https://zapier.com/developer/',
        supportedTriggers: ['webhook_received', 'schedule_triggered', 'app_event'],
        supportedActions: ['webhook_send', 'trigger_zap', 'delay_action'],
        authType: 'api_key',
        isOfficial: true,
        lastUpdated: '2024-01-16',
        compatibility: { contacts: true, deals: true, campaigns: true, analytics: true }
      }
    ];

    setIntegrations(mockIntegrations);
    setFilteredIntegrations(mockIntegrations);
    setLoading(false);
  }, []);

  // Filter integrations
  useEffect(() => {
    let filtered = integrations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query) ||
        integration.provider.toLowerCase().includes(query) ||
        integration.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(integration => integration.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(integration => integration.status === selectedStatus);
    }

    setFilteredIntegrations(filtered);
  }, [integrations, searchQuery, selectedCategory, selectedStatus]);

  const handleInstallIntegration = async (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'installing' }
          : integration
      )
    );

    // Simulate installation
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === integrationId
            ? { ...integration, status: 'installed' }
            : integration
        )
      );
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-green-400';
      case 'installing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return <Check className="w-4 h-4" />;
      case 'installing': return <Clock className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations Marketplace</h2>
          <p className="text-gray-400">Connect your favorite tools and automate workflows</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Request Integration
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-700 text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-700 text-white"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-700 text-white"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="installed">Installed</option>
          <option value="installing">Installing</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto space-x-1 p-1 bg-gray-800 rounded-lg">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gray-700 text-purple-400 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => (
          <motion.div
            key={integration.id}
            className="glass-effect rounded-xl p-6 shadow-sm border border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedIntegration(integration)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">{integration.name}</h3>
                  <p className="text-sm text-gray-400">{integration.provider}</p>
                </div>
              </div>
              {integration.isOfficial && (
                <div className="bg-blue-900/30 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                  Official
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {integration.description}
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-4 mb-4 text-xs text-gray-400">
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                {integration.rating}
              </div>
              <div>{integration.installs.toLocaleString()} installs</div>
              <div className="flex items-center">
                {integration.price.type === 'free' ? (
                  <span className="text-green-400 font-medium">Free</span>
                ) : integration.price.type === 'freemium' ? (
                  <span className="text-purple-400 font-medium">Freemium</span>
                ) : (
                  <span className="text-purple-400 font-medium">
                    ${integration.price.amount}/{integration.price.period}
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-4">
              {integration.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                >
                  {feature}
                </span>
              ))}
              {integration.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-xs text-gray-400 rounded">
                  +{integration.features.length - 3} more
                </span>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (integration.status === 'available') {
                  handleInstallIntegration(integration.id);
                }
              }}
              disabled={integration.status === 'installing'}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                integration.status === 'installed'
                  ? 'bg-green-900/30 text-green-400'
                  : integration.status === 'installing'
                  ? 'bg-yellow-900/30 text-yellow-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <span className={`mr-2 ${getStatusColor(integration.status)}`}>
                {getStatusIcon(integration.status)}
              </span>
              {integration.status === 'installed' && 'Installed'}
              {integration.status === 'installing' && 'Installing...'}
              {integration.status === 'available' && 'Install'}
              {integration.status === 'error' && 'Error'}
            </button>
          </motion.div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">
            <Search className="w-12 h-12 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No integrations found</h3>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Integration Detail Modal */}
      <AnimatePresence>
        {selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedIntegration(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedIntegration.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedIntegration.name}
                    </h3>
                    <p className="text-gray-400">{selectedIntegration.provider}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Description</h4>
                  <p className="text-gray-400">{selectedIntegration.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedIntegration.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-400">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Compatibility</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(selectedIntegration.compatibility).map(([key, supported]) => (
                      <div
                        key={key}
                        className={`text-center p-2 rounded ${
                          supported
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        <div className="capitalize font-medium">{key}</div>
                        <div className="text-xs">
                          {supported ? 'Supported' : 'Not supported'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedIntegration(null)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200"
                  >
                    Close
                  </button>
                  <a
                    href={selectedIntegration.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 text-purple-400 hover:underline"
                  >
                    Documentation <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <button
                    onClick={() => {
                      if (selectedIntegration.status === 'available') {
                        handleInstallIntegration(selectedIntegration.id);
                      }
                    }}
                    disabled={selectedIntegration.status === 'installing'}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      selectedIntegration.status === 'installed'
                        ? 'bg-green-900/30 text-green-400'
                        : selectedIntegration.status === 'installing'
                        ? 'bg-yellow-900/30 text-yellow-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <span className={`mr-2 ${getStatusColor(selectedIntegration.status)}`}>
                      {getStatusIcon(selectedIntegration.status)}
                    </span>
                    {selectedIntegration.status === 'installed' && 'Installed'}
                    {selectedIntegration.status === 'installing' && 'Installing...'}
                    {selectedIntegration.status === 'available' && 'Install'}
                    {selectedIntegration.status === 'error' && 'Retry'}
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

export default IntegrationsMarketplace;