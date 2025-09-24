import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Users, TrendingUp, Eye, MousePointer, Clock,
  CheckCircle, AlertTriangle, RefreshCw, Settings, Filter,
  Search, Download, Play, Pause, Zap, Target, BarChart3,
  Calendar, ExternalLink, UserPlus, ArrowRight, MessageSquare,
  Heart, Share2, Trash2, Edit, Plus, Activity, DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  platform: 'mailchimp' | 'sendgrid' | 'constant_contact' | 'mailjet' | 'aws_ses';
  platformCampaignId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  sentAt?: string;
  scheduledAt?: string;
  recipients: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  complaints: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  revenue?: number;
  goals: Array<{
    type: 'awareness' | 'engagement' | 'conversion' | 'revenue';
    target: number;
    actual: number;
    achieved: boolean;
  }>;
  tags: string[];
  createdAt: string;
  lastSync: string;
  syncStatus: 'synced' | 'pending' | 'error';
}

interface EmailContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  platform: string;
  platformContactId: string;
  subscriptionStatus: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  segments: string[];
  activities: Array<{
    type: 'open' | 'click' | 'bounce' | 'unsubscribe' | 'complaint';
    campaignId: string;
    campaignName: string;
    timestamp: string;
    metadata?: {
      linkUrl?: string;
      ipAddress?: string;
      userAgent?: string;
    };
  }>;
  leadScore: number;
  lastActivity: string;
  lifetimeValue?: number;
  crmContactId?: string;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSync: string;
}

interface PlatformConnection {
  id: string;
  name: string;
  platform: string;
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
  syncStatus: 'active' | 'error' | 'disconnected';
  stats: {
    totalCampaigns: number;
    totalContacts: number;
    totalRevenue: number;
    avgOpenRate: number;
    avgClickRate: number;
  };
  features: string[];
}

const EmailPlatformSync: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [selectedContact, setSelectedContact] = useState<EmailContact | null>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'contacts' | 'platforms' | 'analytics'>('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockPlatforms: PlatformConnection[] = [
      {
        id: '1',
        name: 'Mailchimp Production',
        platform: 'mailchimp',
        connected: true,
        webhookUrl: 'https://n8n.yourapp.com/webhook/mailchimp',
        lastSync: '2024-01-21T14:30:00Z',
        syncStatus: 'active',
        stats: {
          totalCampaigns: 45,
          totalContacts: 12450,
          totalRevenue: 89500,
          avgOpenRate: 24.5,
          avgClickRate: 3.8
        },
        features: ['Campaigns', 'Contacts', 'Automation', 'Analytics', 'A/B Testing']
      },
      {
        id: '2',
        name: 'SendGrid API',
        platform: 'sendgrid',
        connected: true,
        webhookUrl: 'https://n8n.yourapp.com/webhook/sendgrid',
        lastSync: '2024-01-21T14:25:00Z',
        syncStatus: 'active',
        stats: {
          totalCampaigns: 23,
          totalContacts: 8920,
          totalRevenue: 34200,
          avgOpenRate: 22.1,
          avgClickRate: 4.2
        },
        features: ['Transactional', 'Marketing', 'Analytics', 'Templates']
      },
      {
        id: '3',
        name: 'Constant Contact',
        platform: 'constant_contact',
        connected: false,
        syncStatus: 'disconnected',
        stats: {
          totalCampaigns: 0,
          totalContacts: 0,
          totalRevenue: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        },
        features: ['Email Marketing', 'Event Management', 'Social Media', 'Surveys']
      }
    ];

    const mockCampaigns: EmailCampaign[] = [
      {
        id: '1',
        name: 'Holiday Sale 2024',
        subject: '🎄 50% Off Everything - Limited Time!',
        platform: 'mailchimp',
        platformCampaignId: 'mc_12345',
        status: 'sent',
        sentAt: '2024-01-21T10:00:00Z',
        recipients: 5420,
        delivered: 5398,
        opens: 1324,
        clicks: 156,
        bounces: 22,
        unsubscribes: 8,
        complaints: 1,
        openRate: 24.5,
        clickRate: 2.9,
        bounceRate: 0.4,
        unsubscribeRate: 0.15,
        revenue: 23400,
        goals: [
          { type: 'awareness', target: 20, actual: 24.5, achieved: true },
          { type: 'engagement', target: 3, actual: 2.9, achieved: false },
          { type: 'revenue', target: 20000, actual: 23400, achieved: true }
        ],
        tags: ['holiday', 'sale', 'promotional'],
        createdAt: '2024-01-20T09:00:00Z',
        lastSync: '2024-01-21T14:30:00Z',
        syncStatus: 'synced'
      },
      {
        id: '2',
        name: 'Product Launch Announcement',
        subject: 'Introducing Our Game-Changing New Feature',
        platform: 'sendgrid',
        platformCampaignId: 'sg_67890',
        status: 'sending',
        scheduledAt: '2024-01-21T16:00:00Z',
        recipients: 8920,
        delivered: 3456,
        opens: 567,
        clicks: 89,
        bounces: 12,
        unsubscribes: 3,
        complaints: 0,
        openRate: 16.4,
        clickRate: 2.6,
        bounceRate: 0.3,
        unsubscribeRate: 0.09,
        goals: [
          { type: 'awareness', target: 25, actual: 16.4, achieved: false },
          { type: 'engagement', target: 4, actual: 2.6, achieved: false }
        ],
        tags: ['product-launch', 'feature', 'announcement'],
        createdAt: '2024-01-21T08:30:00Z',
        lastSync: '2024-01-21T14:25:00Z',
        syncStatus: 'synced'
      },
      {
        id: '3',
        name: 'Customer Success Stories',
        subject: 'See How Companies Like Yours Are Winning',
        platform: 'mailchimp',
        platformCampaignId: 'mc_54321',
        status: 'scheduled',
        scheduledAt: '2024-01-22T09:00:00Z',
        recipients: 3200,
        delivered: 0,
        opens: 0,
        clicks: 0,
        bounces: 0,
        unsubscribes: 0,
        complaints: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        goals: [
          { type: 'engagement', target: 5, actual: 0, achieved: false },
          { type: 'conversion', target: 50, actual: 0, achieved: false }
        ],
        tags: ['case-study', 'social-proof', 'nurture'],
        createdAt: '2024-01-21T14:00:00Z',
        lastSync: '2024-01-21T14:30:00Z',
        syncStatus: 'synced'
      }
    ];

    const mockContacts: EmailContact[] = [
      {
        id: '1',
        email: 'john.smith@techcorp.com',
        firstName: 'John',
        lastName: 'Smith',
        company: 'TechCorp Solutions',
        platform: 'mailchimp',
        platformContactId: 'mc_contact_123',
        subscriptionStatus: 'subscribed',
        segments: ['enterprise', 'high-value', 'engaged'],
        activities: [
          {
            type: 'click',
            campaignId: '1',
            campaignName: 'Holiday Sale 2024',
            timestamp: '2024-01-21T10:15:00Z',
            metadata: {
              linkUrl: 'https://yourstore.com/holiday-sale',
              ipAddress: '192.168.1.100'
            }
          },
          {
            type: 'open',
            campaignId: '1',
            campaignName: 'Holiday Sale 2024',
            timestamp: '2024-01-21T10:02:00Z'
          }
        ],
        leadScore: 85,
        lastActivity: '2024-01-21T10:15:00Z',
        lifetimeValue: 15600,
        crmContactId: 'crm_contact_456',
        syncStatus: 'synced',
        lastSync: '2024-01-21T14:30:00Z'
      },
      {
        id: '2',
        email: 'sarah.davis@growthinc.com',
        firstName: 'Sarah',
        lastName: 'Davis',
        company: 'Growth Inc',
        platform: 'sendgrid',
        platformContactId: 'sg_contact_789',
        subscriptionStatus: 'subscribed',
        segments: ['startup', 'marketing-focused', 'trial-user'],
        activities: [
          {
            type: 'open',
            campaignId: '2',
            campaignName: 'Product Launch Announcement',
            timestamp: '2024-01-21T12:30:00Z'
          }
        ],
        leadScore: 72,
        lastActivity: '2024-01-21T12:30:00Z',
        crmContactId: 'crm_contact_789',
        syncStatus: 'pending',
        lastSync: '2024-01-21T12:00:00Z'
      }
    ];

    setPlatforms(mockPlatforms);
    setCampaigns(mockCampaigns);
    setContacts(mockContacts);
    setLoading(false);
  }, []);

  // Simulate real-time sync updates
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      // Simulate campaign updates
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.status === 'sending' && Math.random() > 0.7) {
          const newDelivered = Math.min(campaign.recipients, campaign.delivered + Math.floor(Math.random() * 100) + 50);
          const newOpens = Math.floor(newDelivered * (campaign.openRate / 100));
          const newClicks = Math.floor(newOpens * 0.15);
          
          return {
            ...campaign,
            delivered: newDelivered,
            opens: newOpens,
            clicks: newClicks,
            lastSync: new Date().toISOString()
          };
        }
        return campaign;
      }));

      // Simulate new contact activities
      if (Math.random() > 0.8) {
        const activityTypes = ['open', 'click'] as const;
        const newActivity = {
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          campaignId: campaigns[Math.floor(Math.random() * campaigns.length)]?.id || '1',
          campaignName: 'Recent Campaign',
          timestamp: new Date().toISOString()
        };

        setContacts(prev => prev.map((contact, index) => 
          index === 0 ? {
            ...contact,
            activities: [newActivity, ...contact.activities.slice(0, 9)],
            lastActivity: newActivity.timestamp,
            leadScore: Math.min(100, contact.leadScore + (newActivity.type === 'click' ? 3 : 1))
          } : contact
        ));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSync, campaigns]);

  const handleSyncPlatform = async (platformId: string) => {
    setPlatforms(prev => prev.map(platform => 
      platform.id === platformId
        ? { ...platform, syncStatus: 'active', lastSync: new Date().toISOString() }
        : platform
    ));
  };

  const handleSyncToCRM = async (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId
        ? { ...contact, syncStatus: 'synced', lastSync: new Date().toISOString() }
        : contact
    ));
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      mailchimp: 'text-yellow-500',
      sendgrid: 'text-blue-500',
      constant_contact: 'text-orange-500',
      mailjet: 'text-purple-500',
      aws_ses: 'text-red-500'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'sending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'draft': return 'bg-gray-800/50 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'paused': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-800/50 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesPlatform = platformFilter === 'all' || contact.platform === platformFilter;
    const matchesSearch = searchQuery === '' ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPlatform && matchesSearch;
  });

  const totalRevenue = campaigns.reduce((sum, campaign) => sum + (campaign.revenue || 0), 0);
  const avgOpenRate = campaigns.reduce((sum, campaign) => sum + campaign.openRate, 0) / campaigns.length;
  const avgClickRate = campaigns.reduce((sum, campaign) => sum + campaign.clickRate, 0) / campaigns.length;
  const totalContacts = platforms.reduce((sum, platform) => sum + platform.stats.totalContacts, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Platform Sync</h2>
          <p className="text-gray-400 dark:text-gray-400">
            Sync email campaigns and contacts with your CRM for complete lead tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              autoSync
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {autoSync ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {autoSync ? 'Auto Sync' : 'Manual Sync'}
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Configure Webhooks
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-sm">Avg Open Rate</p>
              <p className="text-2xl font-bold text-white">
                {avgOpenRate.toFixed(1)}%
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-sm">Avg Click Rate</p>
              <p className="text-2xl font-bold text-white">
                {avgClickRate.toFixed(1)}%
              </p>
            </div>
            <MousePointer className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-sm">Total Contacts</p>
              <p className="text-2xl font-bold text-white">
                {totalContacts.toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'campaigns', label: 'Campaigns', icon: Mail },
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'platforms', label: 'Platforms', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-purple-400 shadow-sm'
                  : 'text-gray-400 dark:text-gray-400 hover:text-white dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 bg-gray-700 text-white"
        >
          <option value="all">All Platforms</option>
          {platforms.filter(p => p.connected).map(platform => (
            <option key={platform.id} value={platform.platform}>{platform.name}</option>
          ))}
        </select>
        {activeTab === 'campaigns' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 bg-gray-700 text-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
          </select>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="glass-effect rounded-xl p-6 border border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className={`text-sm font-medium ${getPlatformColor(campaign.platform)}`}>
                        {campaign.platform}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 dark:text-gray-400 mb-4">
                      {campaign.subject}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Recipients</span>
                        <p className="font-medium text-white">
                          {campaign.recipients.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Opens</span>
                        <p className="font-medium text-white">
                          {campaign.opens.toLocaleString()} ({campaign.openRate.toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Clicks</span>
                        <p className="font-medium text-white">
                          {campaign.clicks.toLocaleString()} ({campaign.clickRate.toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Bounce Rate</span>
                        <p className="font-medium text-white">
                          {campaign.bounceRate.toFixed(2)}%
                        </p>
                      </div>
                      {campaign.revenue && (
                        <div>
                          <span className="text-gray-400 dark:text-gray-400">Revenue</span>
                          <p className="font-medium text-green-600">
                            ${campaign.revenue.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Last Sync</span>
                        <p className="font-medium text-white">
                          {new Date(campaign.lastSync).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {campaign.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {campaign.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-800/50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {campaign.syncStatus === 'synced' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : campaign.syncStatus === 'pending' ? (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-400 dark:hover:text-gray-300">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="glass-effect rounded-xl p-6 border border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <span className={`text-sm font-medium ${getPlatformColor(contact.platform)}`}>
                        {contact.platform}
                      </span>
                      <span className="text-sm font-medium text-white">
                        Score: {contact.leadScore}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 dark:text-gray-400 mb-2">
                      {contact.email} {contact.company && `• ${contact.company}`}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Status</span>
                        <p className={`font-medium ${
                          contact.subscriptionStatus === 'subscribed' ? 'text-green-600' : 
                          contact.subscriptionStatus === 'unsubscribed' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {contact.subscriptionStatus}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Activities</span>
                        <p className="font-medium text-white">
                          {contact.activities.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Last Activity</span>
                        <p className="font-medium text-white">
                          {new Date(contact.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                      {contact.lifetimeValue && (
                        <div>
                          <span className="text-gray-400 dark:text-gray-400">LTV</span>
                          <p className="font-medium text-green-600">
                            ${contact.lifetimeValue.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {contact.segments.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contact.segments.map((segment, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                          >
                            {segment}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {contact.crmContactId ? (
                      <CheckCircle className="w-5 h-5 text-green-500" title="Synced to CRM" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncToCRM(contact.id);
                        }}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Sync to CRM
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <motion.div
            key="platforms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {platforms.map(platform => (
              <div
                key={platform.id}
                className="glass-effect rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <h3 className="font-semibold text-white">{platform.name}</h3>
                      <p className="text-sm text-gray-400 dark:text-gray-400 capitalize">{platform.platform}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSyncPlatform(platform.id)}
                    className="flex items-center px-3 py-1 text-purple-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync
                  </button>
                </div>

                {platform.connected ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Campaigns</span>
                        <p className="font-medium text-white">
                          {platform.stats.totalCampaigns}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Contacts</span>
                        <p className="font-medium text-white">
                          {platform.stats.totalContacts.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Revenue</span>
                        <p className="font-medium text-green-600">
                          ${platform.stats.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-400">Avg Open Rate</span>
                        <p className="font-medium text-white">
                          {platform.stats.avgOpenRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-800/50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {platform.webhookUrl && (
                      <div>
                        <span className="text-gray-400 dark:text-gray-400 text-sm">Webhook URL:</span>
                        <p className="text-xs text-white font-mono bg-gray-800/50 dark:bg-gray-700 p-2 rounded mt-1 truncate">
                          {platform.webhookUrl}
                        </p>
                      </div>
                    )}

                    {platform.lastSync && (
                      <p className="text-xs text-gray-400 dark:text-gray-400">
                        Last sync: {new Date(platform.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 dark:text-gray-400 mb-4">Platform not connected</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Connect Platform
                    </button>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Campaign Performance Chart */}
            <div className="glass-effect rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Campaign Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredCampaigns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="openRate" fill="#8b5cf6" name="Open Rate %" />
                  <Bar dataKey="clickRate" fill="#06b6d4" name="Click Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Distribution */}
            <div className="glass-effect rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Platform Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platforms.filter(p => p.connected).map(p => ({
                      name: p.name,
                      value: p.stats.totalContacts
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platforms.filter(p => p.connected).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6', '#06b6d4', '#10b981'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCampaign(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedCampaign.name}
                </h3>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-gray-400 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Campaign Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-400">Subject:</span>
                        <span className="text-white">{selectedCampaign.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-400">Platform:</span>
                        <span className="text-white capitalize">{selectedCampaign.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedCampaign.status)}`}>
                          {selectedCampaign.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Performance Goals</h4>
                    <div className="space-y-2">
                      {selectedCampaign.goals.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 dark:bg-gray-700 rounded">
                          <span className="text-white capitalize">
                            {goal.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 dark:text-gray-400 text-sm">
                              {goal.actual} / {goal.target}
                            </span>
                            {goal.achieved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-700/50 dark:bg-gray-700 rounded">
                        <div className="text-2xl font-bold text-white">
                          {selectedCampaign.opens.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-400">Opens</div>
                        <div className="text-sm text-purple-400">{selectedCampaign.openRate.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-gray-700/50 dark:bg-gray-700 rounded">
                        <div className="text-2xl font-bold text-white">
                          {selectedCampaign.clicks.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-400">Clicks</div>
                        <div className="text-sm text-purple-600">{selectedCampaign.clickRate.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-gray-700/50 dark:bg-gray-700 rounded">
                        <div className="text-2xl font-bold text-white">
                          {selectedCampaign.bounces.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-400">Bounces</div>
                        <div className="text-sm text-red-600">{selectedCampaign.bounceRate.toFixed(2)}%</div>
                      </div>
                      {selectedCampaign.revenue && (
                        <div className="text-center p-3 bg-gray-700/50 dark:bg-gray-700 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedCampaign.revenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400 dark:text-gray-400">Revenue</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailPlatformSync;