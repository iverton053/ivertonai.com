import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  BarChart3,
  Users,
  Sparkles,
  Brain,
  TestTube,
  Settings,
  DollarSign,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Share,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Search,
  Calendar,
  TrendingDown,
  Activity,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

import CampaignCreationWizard from './CampaignCreationWizard';
import AudienceTargeting from './AudienceTargeting';
import CampaignAnalytics from './CampaignAnalytics';
import ABTestingManager from './ABTestingManager';
import AutomatedOptimization from './AutomatedOptimization';
import { useAdCampaignStore } from '../../stores/adCampaignStore';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  platform: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  createdAt: string;
  updatedAt: string;
  objective: string;
  audienceSize: number;
  ageRange: string;
  locations: string[];
  devices: string[];
  creativeSets: number;
  abTests: number;
  optimizationScore: number;
  lastOptimized: string;
  predictedPerformance?: {
    expectedCtr: number;
    expectedConversions: number;
    confidenceInterval: number;
  };
}

const EnhancedAdCampaignManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'spend' | 'roas' | 'ctr' | 'date'>('roas');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | string>('all');
  const [dateRange, setDateRange] = useState('7d');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in production this would come from the store
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Q1 Product Launch - Facebook',
      status: 'active',
      platform: 'facebook',
      budget: 5000,
      spend: 3247.50,
      impressions: 1250000,
      clicks: 15600,
      conversions: 234,
      ctr: 1.25,
      cpc: 0.21,
      cpm: 2.60,
      roas: 320,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-22',
      objective: 'conversions',
      audienceSize: 2500000,
      ageRange: '25-54',
      locations: ['US', 'CA', 'UK'],
      devices: ['mobile', 'desktop'],
      creativeSets: 3,
      abTests: 2,
      optimizationScore: 87,
      lastOptimized: '2024-01-21',
      predictedPerformance: {
        expectedCtr: 1.42,
        expectedConversions: 267,
        confidenceInterval: 0.85
      }
    },
    {
      id: '2',
      name: 'Brand Awareness - Google Ads',
      status: 'active',
      platform: 'google',
      budget: 3000,
      spend: 2156.20,
      impressions: 890000,
      clicks: 8900,
      conversions: 156,
      ctr: 1.00,
      cpc: 0.24,
      cpm: 2.42,
      roas: 245,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-22',
      objective: 'brand_awareness',
      audienceSize: 1800000,
      ageRange: '18-65',
      locations: ['US'],
      devices: ['mobile', 'desktop', 'tablet'],
      creativeSets: 5,
      abTests: 1,
      optimizationScore: 72,
      lastOptimized: '2024-01-20'
    },
    {
      id: '3',
      name: 'Retargeting Campaign - Instagram',
      status: 'paused',
      platform: 'instagram',
      budget: 1500,
      spend: 987.30,
      impressions: 450000,
      clicks: 5400,
      conversions: 89,
      ctr: 1.20,
      cpc: 0.18,
      cpm: 2.19,
      roas: 189,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-21',
      objective: 'conversions',
      audienceSize: 890000,
      ageRange: '22-45',
      locations: ['US', 'CA'],
      devices: ['mobile'],
      creativeSets: 2,
      abTests: 1,
      optimizationScore: 65,
      lastOptimized: '2024-01-19'
    }
  ]);

  const [globalMetrics, setGlobalMetrics] = useState({
    totalSpend: 6390.00,
    totalImpressions: 2590000,
    totalClicks: 29900,
    totalConversions: 479,
    averageCtr: 1.15,
    averageCpc: 0.214,
    averageRoas: 284,
    activeCampaigns: 2,
    totalCampaigns: 3
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'audiences', label: 'Audiences', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'testing', label: 'A/B Testing', icon: TestTube },
    { id: 'optimization', label: 'Automation', icon: Brain }
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'google', name: 'Google Ads', icon: '🔍', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' }
  ];

  // Filter campaigns based on current filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || campaign.platform === filterPlatform;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'spend':
        return b.spend - a.spend;
      case 'roas':
        return b.roas - a.roas;
      case 'ctr':
        return b.ctr - a.ctr;
      case 'date':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
  };

  const handleBulkAction = (action: string) => {
    if (selectedCampaigns.length === 0) return;

    switch (action) {
      case 'pause':
        setCampaigns(prev => prev.map(campaign =>
          selectedCampaigns.includes(campaign.id)
            ? { ...campaign, status: 'paused' }
            : campaign
        ));
        break;
      case 'activate':
        setCampaigns(prev => prev.map(campaign =>
          selectedCampaigns.includes(campaign.id)
            ? { ...campaign, status: 'active' }
            : campaign
        ));
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedCampaigns.length} campaigns?`)) {
          setCampaigns(prev => prev.filter(campaign => !selectedCampaigns.includes(campaign.id)));
        }
        break;
    }
    setSelectedCampaigns([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/30 text-green-400 border-green-400/30';
      case 'paused':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-400/30';
      case 'draft':
        return 'bg-gray-900/30 text-gray-400 border-gray-400/30';
      case 'completed':
        return 'bg-blue-900/30 text-blue-400 border-blue-400/30';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-400/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platforms.find(pl => pl.id === platform);
    return p ? p.icon : '📊';
  };

  const getPlatformColor = (platform: string) => {
    const p = platforms.find(pl => pl.id === platform);
    return p ? p.color : 'bg-gray-600';
  };

  const handleExportData = () => {
    // Create export data
    const exportData = {
      campaigns: sortedCampaigns,
      summary: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalSpend: campaigns.reduce((sum, c) => sum + c.spend, 0),
        totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
        averageRoas: campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length
      },
      exportDate: new Date().toISOString(),
      dateRange: dateRange
    };

    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ad-campaigns-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);

    try {
      // Simulate API call to refresh campaign data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you'd fetch fresh data from your API
      // For now, we'll just update the timestamps and add small random variations
      setCampaigns(prev => prev.map(campaign => ({
        ...campaign,
        updatedAt: new Date().toISOString().split('T')[0],
        spend: campaign.spend + (Math.random() * 100 - 50), // Random variation
        conversions: Math.max(0, campaign.conversions + Math.floor(Math.random() * 10 - 5)),
        impressions: campaign.impressions + Math.floor(Math.random() * 10000 - 5000)
      })));

    } catch (error) {
      console.error('Error refreshing campaign data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Performance data for charts
  const performanceData = [
    { name: 'Jan 15', spend: 450, conversions: 23, roas: 280 },
    { name: 'Jan 16', spend: 520, conversions: 28, roas: 295 },
    { name: 'Jan 17', spend: 480, conversions: 25, roas: 310 },
    { name: 'Jan 18', spend: 600, conversions: 35, roas: 325 },
    { name: 'Jan 19', spend: 550, conversions: 32, roas: 340 },
    { name: 'Jan 20', spend: 580, conversions: 38, roas: 355 },
    { name: 'Jan 21', spend: 630, conversions: 42, roas: 370 }
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-400" />
            <span>Advanced Campaign Manager</span>
          </h1>
          <p className="text-gray-400 mt-1">AI-powered cross-platform advertising with advanced analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreationWizard(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <div className="glass-effect rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Spend</h3>
          <p className="text-2xl font-bold text-white">${globalMetrics.totalSpend.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">+8.2%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Impressions</h3>
          <p className="text-2xl font-bold text-white">{(globalMetrics.totalImpressions / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-1">Total reach</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded-full">+5.7%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Avg CTR</h3>
          <p className="text-2xl font-bold text-white">{globalMetrics.averageCtr.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Click rate</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded-full">+15.3%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">ROAS</h3>
          <p className="text-2xl font-bold text-white">{globalMetrics.averageRoas}%</p>
          <p className="text-xs text-gray-500 mt-1">Return on spend</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded-full">{globalMetrics.activeCampaigns}/{globalMetrics.totalCampaigns}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Active Campaigns</h3>
          <p className="text-2xl font-bold text-white">{globalMetrics.activeCampaigns}</p>
          <p className="text-xs text-gray-500 mt-1">Currently running</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="glass-effect rounded-xl p-2 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Performance Chart */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Performance Overview</h3>
                    <p className="text-gray-400">Real-time campaign performance metrics</p>
                  </div>

                  <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="14d">Last 14 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                    </select>

                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-400">Spend</span>
                      <div className="w-3 h-3 bg-blue-500 rounded-full ml-4"></div>
                      <span className="text-gray-400">ROAS</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#F3F4F6'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="url(#colorGradient1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stackId="2"
                      stroke="#06b6d4"
                      fill="url(#colorGradient2)"
                    />
                    <defs>
                      <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Campaign Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Performing Campaigns</h3>

                  <div className="space-y-4">
                    {sortedCampaigns.slice(0, 5).map((campaign, index) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{campaign.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-400">{campaign.platform}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-green-400">{campaign.roas}% ROAS</p>
                          <p className="text-sm text-gray-400">${campaign.spend} spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Platform Distribution</h3>

                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={platforms.slice(0, 4).map((platform, index) => ({
                          name: platform.name,
                          value: Math.random() * 1000 + 500,
                          fill: COLORS[index]
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}`}
                      >
                        {platforms.slice(0, 4).map((platform, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {platforms.slice(0, 4).map((platform, index) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                        <span className="text-sm text-gray-300">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Filters and Controls */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search campaigns..."
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>

                    <select
                      value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Platforms</option>
                      {platforms.map(platform => (
                        <option key={platform.id} value={platform.id}>{platform.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">View:</span>
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="roas">Sort by ROAS</option>
                      <option value="spend">Sort by Spend</option>
                      <option value="ctr">Sort by CTR</option>
                      <option value="name">Sort by Name</option>
                      <option value="date">Sort by Date</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedCampaigns.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-medium">
                        {selectedCampaigns.length} campaign{selectedCampaigns.length !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleBulkAction('activate')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                        >
                          <Play className="w-4 h-4 inline mr-1" />
                          Activate
                        </button>
                        <button
                          onClick={() => handleBulkAction('pause')}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                        >
                          <Pause className="w-4 h-4 inline mr-1" />
                          Pause
                        </button>
                        <button
                          onClick={() => handleBulkAction('delete')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign List */}
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedCampaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect rounded-xl p-6 hover:bg-gray-800/50 transition-all group cursor-pointer"
                      onClick={() => {
                        if (selectedCampaigns.includes(campaign.id)) {
                          setSelectedCampaigns(prev => prev.filter(id => id !== campaign.id));
                        } else {
                          setSelectedCampaigns(prev => [...prev, campaign.id]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCampaigns.includes(campaign.id)}
                            onChange={() => {}}
                            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                              {campaign.name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-4 h-4 ${getPlatformColor(campaign.platform)} rounded flex items-center justify-center text-xs`}>
                                {getPlatformIcon(campaign.platform)}
                              </div>
                              <span className="text-sm text-gray-400 capitalize">{campaign.platform}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-white rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-400 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500">Budget / Spend</span>
                            <p className="text-sm text-white">
                              ${campaign.budget} / <span className="text-orange-400">${campaign.spend}</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">ROAS</span>
                            <p className={`text-sm font-semibold ${
                              campaign.roas >= 300 ? 'text-green-400'
                              : campaign.roas >= 200 ? 'text-yellow-400'
                              : 'text-red-400'
                            }`}>
                              {campaign.roas}%
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-500">CTR</p>
                            <p className="text-sm text-white">{campaign.ctr.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">CPC</p>
                            <p className="text-sm text-white">${campaign.cpc.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Conv</p>
                            <p className="text-sm text-white">{campaign.conversions}</p>
                          </div>
                        </div>

                        {campaign.predictedPerformance && (
                          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-blue-400 font-medium">AI Prediction</span>
                              <span className="text-xs text-green-400">
                                {Math.round(campaign.predictedPerformance.confidenceInterval * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-xs text-gray-300">
                              Expected CTR: {campaign.predictedPerformance.expectedCtr.toFixed(2)}%
                              ({campaign.predictedPerformance.expectedCtr > campaign.ctr ? '+' : ''}
                              {((campaign.predictedPerformance.expectedCtr - campaign.ctr) / campaign.ctr * 100).toFixed(1)}%)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm">
                              <Eye className="w-4 h-4" />
                              <span>Details</span>
                            </button>
                            <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm">
                              <BarChart3 className="w-4 h-4" />
                              <span>Analytics</span>
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCampaign(campaign.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              campaign.status === 'active'
                                ? 'text-yellow-400 hover:bg-yellow-900/20'
                                : 'text-green-400 hover:bg-green-900/20'
                            }`}
                          >
                            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Table View
                <div className="glass-effect rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedCampaigns.length === sortedCampaigns.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCampaigns(sortedCampaigns.map(c => c.id));
                                } else {
                                  setSelectedCampaigns([]);
                                }
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Spend</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CTR</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CPC</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ROAS</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {sortedCampaigns.map((campaign) => (
                          <tr key={campaign.id} className="hover:bg-gray-800/30">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedCampaigns.includes(campaign.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCampaigns(prev => [...prev, campaign.id]);
                                  } else {
                                    setSelectedCampaigns(prev => prev.filter(id => id !== campaign.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-white">{campaign.name}</div>
                                <div className="text-sm text-gray-400">{campaign.objective}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 ${getPlatformColor(campaign.platform)} rounded flex items-center justify-center text-sm`}>
                                  {getPlatformIcon(campaign.platform)}
                                </div>
                                <span className="text-sm text-white capitalize">{campaign.platform}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              ${campaign.budget.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400">
                              ${campaign.spend.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {campaign.ctr.toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              ${campaign.cpc.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${
                                campaign.roas >= 300 ? 'text-green-400'
                                : campaign.roas >= 200 ? 'text-yellow-400'
                                : 'text-red-400'
                              }`}>
                                {campaign.roas}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-purple-400 hover:text-purple-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-white">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleCampaign(campaign.id)}
                                  className={`${
                                    campaign.status === 'active'
                                      ? 'text-yellow-400 hover:text-yellow-300'
                                      : 'text-green-400 hover:text-green-300'
                                  }`}
                                >
                                  {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                <button className="text-gray-400 hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {sortedCampaigns.length === 0 && (
                <div className="glass-effect rounded-xl p-12 text-center">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No campaigns found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchQuery || filterStatus !== 'all' || filterPlatform !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first campaign to start advertising'
                    }
                  </p>
                  <button
                    onClick={() => setShowCreationWizard(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Other Tab Components */}
          {activeTab === 'audiences' && <AudienceTargeting />}
          {activeTab === 'analytics' && <CampaignAnalytics />}
          {activeTab === 'testing' && <ABTestingManager />}
          {activeTab === 'optimization' && <AutomatedOptimization />}
        </motion.div>
      </AnimatePresence>

      {/* Campaign Creation Wizard */}
      <AnimatePresence>
        {showCreationWizard && (
          <CampaignCreationWizard
            isOpen={showCreationWizard}
            onClose={() => setShowCreationWizard(false)}
            onCampaignCreate={(campaignData) => {
              // Handle campaign creation
              setShowCreationWizard(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAdCampaignManager;