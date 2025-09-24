import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Users,
  TrendingUp,
  Send,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { useEmailMarketingStore } from '../../stores/emailMarketingStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Cell } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import CampaignManager from './CampaignManager';
import CampaignCreationModal from './CampaignCreationModal';
import SubscriberManager from './SubscriberManager';
import EmailPlatformSync from './EmailPlatformSync';

const EmailMarketingDashboard: React.FC = () => {
  const {
    campaigns,
    subscribers,
    lists,
    campaignAnalytics,
    overallAnalytics,
    isLoading,
    error,
    loadCampaigns,
    loadSubscribers,
    loadLists,
    createCampaign,
    sendCampaign,
    getTotalSubscribers,
    getActiveSubscribers,
    getAverageOpenRate,
    getAverageClickRate,
    getTotalRevenue,
    getTopPerformingCampaigns,
    clearError
  } = useEmailMarketingStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock agency data - replace with actual user context
  const agencyId = 'mock-agency-id';
  const clientId = undefined; // Show all clients

  useEffect(() => {
    // Load initial data
    loadCampaigns(agencyId, clientId);
    loadSubscribers(agencyId, clientId);
    loadLists(agencyId, clientId);
  }, []);

  // Calculate summary statistics
  const totalSubscribers = getTotalSubscribers();
  const activeSubscribers = getActiveSubscribers();
  const avgOpenRate = getAverageOpenRate();
  const avgClickRate = getAverageClickRate();
  const totalRevenue = getTotalRevenue();
  const topCampaigns = getTopPerformingCampaigns(5);

  // Mock data for charts
  const performanceData = [
    { date: '2024-01-01', opens: 1240, clicks: 340, conversions: 45 },
    { date: '2024-01-02', opens: 1180, clicks: 320, conversions: 38 },
    { date: '2024-01-03', opens: 1320, clicks: 380, conversions: 52 },
    { date: '2024-01-04', opens: 1290, clicks: 360, conversions: 48 },
    { date: '2024-01-05', opens: 1450, clicks: 420, conversions: 61 },
    { date: '2024-01-06', opens: 1380, clicks: 390, conversions: 55 },
    { date: '2024-01-07', opens: 1520, clicks: 450, conversions: 68 }
  ];

  const campaignTypeData = [
    { name: 'Newsletter', value: 45, color: '#8b5cf6' },
    { name: 'Promotional', value: 30, color: '#06b6d4' },
    { name: 'Welcome', value: 15, color: '#10b981' },
    { name: 'Abandoned Cart', value: 10, color: '#f59e0b' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'scheduled':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'draft':
        return 'text-gray-400 bg-gray-700/500/10 border-gray-500/20';
      case 'sending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'paused':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-400 bg-gray-700/500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'sending':
        return <Send className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Marketing</h1>
          <p className="text-gray-400 mt-1">Manage campaigns, subscribers, and automation workflows</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Subscribers</p>
              <p className="text-2xl font-bold text-white">{totalSubscribers.toLocaleString()}</p>
              <p className="text-green-400 text-xs mt-1">+12.5% this month</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Subscribers</p>
              <p className="text-2xl font-bold text-white">{activeSubscribers.toLocaleString()}</p>
              <p className="text-green-400 text-xs mt-1">{formatPercentage((activeSubscribers / totalSubscribers) * 100)}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Open Rate</p>
              <p className="text-2xl font-bold text-white">{formatPercentage(avgOpenRate)}</p>
              <p className="text-blue-400 text-xs mt-1">Industry: 21.3%</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Click Rate</p>
              <p className="text-2xl font-bold text-white">{formatPercentage(avgClickRate)}</p>
              <p className="text-orange-400 text-xs mt-1">Industry: 2.6%</p>
            </div>
            <MousePointer className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
              <p className="text-emerald-400 text-xs mt-1">+23.4% this month</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Campaigns Sent</p>
              <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'sent').length}</p>
              <p className="text-cyan-400 text-xs mt-1">This month</p>
            </div>
            <Send className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-effect rounded-xl p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'campaigns', label: 'Campaigns', icon: Mail },
            { id: 'subscribers', label: 'Subscribers', icon: Users },
            { id: 'sync', label: 'Platform Sync', icon: Settings },
            { id: 'automation', label: 'Automation', icon: Zap },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const buttonClass = isActive 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700';
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${buttonClass}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="xl:col-span-2 glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Performance Trends</h2>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="opensGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="opens"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#opensGradient)"
                      name="Opens"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#06b6d4"
                      fillOpacity={1}
                      fill="url(#clicksGradient)"
                      name="Clicks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Campaign Types</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsPieChart
                      data={campaignTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {campaignTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {campaignTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-300 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Campaigns & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Campaigns</h2>
                  <button className="text-purple-400 hover:text-purple-300 text-sm">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign, index) => {
                    const analytics = campaignAnalytics[campaign.id];
                    return (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-sm">{campaign.name}</h3>
                            <p className="text-gray-400 text-xs">
                              {campaign.sendTime ? format(parseISO(campaign.sendTime), 'MMM dd, yyyy') : 'Not scheduled'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {analytics && (
                            <div className="text-right">
                              <p className="text-white text-sm font-medium">
                                {formatPercentage(analytics.openRate)}
                              </p>
                              <p className="text-gray-400 text-xs">Open Rate</p>
                            </div>
                          )}
                          <span className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
                            {getStatusIcon(campaign.status)}
                            <span className="capitalize">{campaign.status}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Top Performers</h2>
                  <button className="text-purple-400 hover:text-purple-300 text-sm">
                    View Details
                  </button>
                </div>
                
                <div className="space-y-4">
                  {topCampaigns.map((campaign, index) => {
                    const analytics = campaignAnalytics[campaign.id];
                    let rankClass = 'bg-gray-600 text-white';
                    if (index === 0) rankClass = 'bg-yellow-500 text-black';
                    else if (index === 1) rankClass = 'bg-gray-400 text-black';
                    else if (index === 2) rankClass = 'bg-orange-500 text-white';
                    
                    return (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rankClass}`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-sm">{campaign.name}</h3>
                            <p className="text-gray-400 text-xs">{campaign.subject}</p>
                          </div>
                        </div>
                        
                        {analytics && (
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">
                              {formatPercentage(analytics.clickRate)}
                            </p>
                            <p className="text-gray-400 text-xs">Click Rate</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <CampaignManager onCreateCampaign={() => setShowCreateModal(true)} />
          </motion.div>
        )}

        {activeTab === 'subscribers' && (
          <motion.div
            key="subscribers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <SubscriberManager />
          </motion.div>
        )}

        {activeTab === 'sync' && (
          <motion.div
            key="sync"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <EmailPlatformSync />
          </motion.div>
        )}

        {/* Other tabs would be implemented here */}
        {(activeTab === 'automation' || activeTab === 'analytics') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-effect rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
            </h3>
            <p className="text-gray-400">
              The {activeTab} section is being built. Check back soon for updates!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Creation Modal */}
      <CampaignCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default EmailMarketingDashboard;