import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Plus,
  Settings,
  BarChart3,
  Users,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Brain,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  TestTube,
  Lightbulb
} from 'lucide-react';
import { useAdCampaignStore } from '../stores/adCampaignStore';
import { AdPlatform } from '../services/adPlatformService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdCampaignManager: React.FC = () => {
  const {
    campaigns,
    activeCampaigns,
    connectedAccounts,
    performanceMetrics,
    adCreatives,
    activeTests,
    automationSettings,
    spendingAlerts,
    budgetAllocations,
    loading,
    errors,
    createCampaign,
    generateAdCreative,
    optimizeAllCampaigns,
    optimizeBudgetAllocation,
    connectAdAccount,
    refreshAllPerformance,
    clearErrors,
    updateAutomationSettings,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    applySuggestedOptimizations,
    refreshAccountData,
    disconnectAdAccount
  } = useAdCampaignStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<AdPlatform[]>([]);
  const [n8nStatus, setN8nStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [useEnhancedAI, setUseEnhancedAI] = useState(true);
  const [accountToConnect, setAccountToConnect] = useState<AdPlatform | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    budget: 100,
    objective: 'conversions'
  });

  const [creativeForm, setCreativeForm] = useState({
    industry: 'technology',
    target_audience: 'business professionals',
    campaign_objective: 'conversions',
    brand_voice: 'professional' as const,
    product_service: '',
    key_benefits: [''],
    call_to_action: 'Learn More',
    platform: 'facebook_ads',
    ad_format: 'single_image' as const
  });

  useEffect(() => {
    refreshAllPerformance();
    checkN8nStatus();
  }, []);

  const checkN8nStatus = async () => {
    try {
      const response = await fetch('http://localhost:5678/rest/workflows', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      setN8nStatus(response.ok ? 'connected' : 'disconnected');
    } catch (error) {
      setN8nStatus('disconnected');
    }
  };

  const platforms = [
    { id: 'google_ads', name: 'Google Ads', icon: '🔍', color: 'bg-blue-500' },
    { id: 'facebook_ads', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'instagram_ads', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: 'linkedin_ads', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'pinterest_ads', name: 'Pinterest', icon: '📌', color: 'bg-red-400' },
    { id: 'snapchat_ads', name: 'Snapchat', icon: '👻', color: 'bg-yellow-400' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'creatives', label: 'Ad Creatives', icon: Sparkles },
    { id: 'optimization', label: 'Optimization', icon: Brain },
    { id: 'testing', label: 'A/B Testing', icon: TestTube },
    { id: 'accounts', label: 'Accounts', icon: Settings }
  ];

  const handleCreateCampaign = async () => {
    // Validation
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }
    if (!campaignForm.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    if (campaignForm.budget < 1) {
      alert('Budget must be at least $1');
      return;
    }

    await createCampaign(selectedPlatforms, {
      name: campaignForm.name,
      budget: campaignForm.budget,
      status: 'paused' // Start paused for review
    });

    setShowCreateModal(false);
    setCampaignForm({ name: '', budget: 100, objective: 'conversions' });
    setSelectedPlatforms([]);
  };

  const handleGenerateCreative = async () => {
    // Validation
    if (!creativeForm.product_service.trim()) {
      alert('Please enter a product or service description');
      return;
    }
    if (!creativeForm.target_audience.trim()) {
      alert('Please enter target audience');
      return;
    }
    if (creativeForm.key_benefits.filter(b => b.trim()).length === 0) {
      alert('Please add at least one key benefit');
      return;
    }

    // Use n8n workflow endpoint for enhanced ad copy generation if enabled and connected
    if (useEnhancedAI && n8nStatus === 'connected') {
      try {
        const response = await fetch('http://localhost:5678/webhook/ads-copy-generator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform: creativeForm.platform,
            industry: creativeForm.industry,
            target_audience: creativeForm.target_audience,
            product_service: creativeForm.product_service,
            key_benefits: creativeForm.key_benefits.filter(b => b.trim()),
            brand_voice: creativeForm.brand_voice,
            campaign_objective: creativeForm.campaign_objective,
            call_to_action: creativeForm.call_to_action,
            ad_format: creativeForm.ad_format
          })
        });

        if (response.ok) {
          const n8nResult = await response.json();
          
          // Transform n8n response to match existing store format
          const transformedCreative = {
            ...creativeForm,
            key_benefits: creativeForm.key_benefits.filter(b => b.trim()),
            headline: n8nResult.headline || n8nResult.primary_text || '',
            description: n8nResult.description || n8nResult.secondary_text || '',
            body_text: n8nResult.body_text || n8nResult.body || n8nResult.primary_text || '',
            cta_text: n8nResult.cta_text || creativeForm.call_to_action,
            hashtags: n8nResult.hashtags || [],
            performance_prediction: {
              confidence_score: n8nResult.quality_score || 0.85,
              estimated_ctr: n8nResult.estimated_ctr || Math.random() * 3 + 1
            }
          };

          await generateAdCreative(transformedCreative);
          setShowCreativeModal(false);
          return;
        }
      } catch (error) {
        console.error('n8n workflow error, falling back to original method:', error);
      }
    }

    // Fallback to original method
    await generateAdCreative({
      ...creativeForm,
      key_benefits: creativeForm.key_benefits.filter(b => b.trim())
    });

    setShowCreativeModal(false);
  };

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  // Button Handlers
  const handleEditCampaign = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    // TODO: Open edit modal
    console.log('Edit campaign:', campaignId);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(campaignId);
    }
  };

  const handleViewDetails = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setShowCampaignDetails(true);
  };

  const handleToggleCampaign = async (campaign: any) => {
    if (campaign.status === 'active') {
      await pauseCampaign(campaign.id);
    } else {
      await resumeCampaign(campaign.id);
    }
  };

  const handleCopyCreative = (creative: any) => {
    const text = `${creative.headline}\n${creative.description}\n${creative.body_text}`;
    navigator.clipboard.writeText(text);
    alert('Creative copied to clipboard!');
  };

  const handleCreateABTest = () => {
    // TODO: Implement A/B test creation
    alert('A/B Test creation will be implemented');
  };

  const handleRefreshAccount = (accountId: string) => {
    refreshAccountData();
    alert('Account data refreshed!');
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (window.confirm('Disconnect this account?')) {
      await disconnectAdAccount(accountId);
    }
  };

  const handleConnectAccount = (platform: AdPlatform) => {
    setAccountToConnect(platform);
    setShowAccountModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-400" />
            <span>Ad Campaign Manager</span>
          </h1>
          <p className="text-gray-400 mt-1">Cross-platform campaign management with AI optimization</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={optimizeAllCampaigns}
            disabled={loading.optimization}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Brain className={`w-4 h-4 ${loading.optimization ? 'animate-pulse' : ''}`} />
            <span>AI Optimize</span>
          </motion.button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            {loading.campaigns && <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <h3 className="text-lg font-semibold text-white">Total Spend</h3>
          <p className="text-3xl font-bold text-green-400">
            ${performanceMetrics.totalSpend.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">Across all platforms</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-blue-400" />
            {loading.performance && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <h3 className="text-lg font-semibold text-white">Impressions</h3>
          <p className="text-3xl font-bold text-blue-400">
            {(performanceMetrics.totalImpressions / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-gray-400 mt-1">Total reach</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Avg CTR</h3>
          <p className="text-3xl font-bold text-orange-400">
            {performanceMetrics.averageCTR.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Click-through rate</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">ROAS</h3>
          <p className="text-3xl font-bold text-purple-400">
            {performanceMetrics.averageROAS.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Return on ad spend</p>
        </div>
      </motion.div>

      {/* Alerts */}
      {spendingAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-4 border-l-4 border-orange-500"
        >
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h4 className="font-semibold text-white">Campaign Alerts</h4>
          </div>
          <div className="space-y-2">
            {spendingAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="text-sm text-gray-300">
                <span className="font-medium">{alert.type.replace('_', ' ').toUpperCase()}:</span> {alert.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {Object.values(errors).some(error => error) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-4 border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-red-400 font-semibold">Errors detected</h4>
              {Object.entries(errors).map(([key, error]) => 
                error && (
                  <p key={key} className="text-red-300 text-sm mt-1">{key}: {error}</p>
                )
              )}
            </div>
            <button
              onClick={clearErrors}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="glass-effect rounded-xl p-2 overflow-x-auto">
        <nav className="flex space-x-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
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
          className="space-y-6"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Performance Chart */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Campaign Performance</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-400">Spend</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-400">Conversions</span>
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={campaigns.slice(0, 7).map((campaign, i) => ({
                    name: campaign.name.substring(0, 10) + '...',
                    spend: campaign.spend,
                    conversions: campaign.conversions,
                    roas: campaign.roas
                  }))}>
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

              {/* Platform Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Platform Performance</h3>
                  
                  <div className="space-y-4">
                    {platforms.slice(0, 4).map((platform, index) => {
                      const platformCampaigns = campaigns.filter(c => c.platform === platform.id);
                      const totalSpend = platformCampaigns.reduce((sum, c) => sum + c.spend, 0);
                      const totalConversions = platformCampaigns.reduce((sum, c) => sum + c.conversions, 0);
                      
                      return (
                        <div key={platform.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                              {platform.icon}
                            </div>
                            <div>
                              <p className="font-medium text-white">{platform.name}</p>
                              <p className="text-sm text-gray-400">{platformCampaigns.length} campaigns</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-white">${totalSpend.toLocaleString()}</p>
                            <p className="text-sm text-gray-400">{totalConversions} conversions</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Top Performing Campaigns</h3>
                  
                  <div className="space-y-4">
                    {campaigns
                      .sort((a, b) => b.roas - a.roas)
                      .slice(0, 5)
                      .map((campaign, index) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-white">{campaign.name}</p>
                              <p className="text-sm text-gray-400">{campaign.platform}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-green-400">{campaign.roas.toFixed(0)}% ROAS</p>
                            <p className="text-sm text-gray-400">${campaign.spend} spend</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-xl p-6 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-white">{campaign.name}</h4>
                      <p className="text-sm text-gray-400">{campaign.platform}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'active' 
                          ? 'bg-green-900/30 text-green-400'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {campaign.status}
                      </span>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        <button 
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="p-1 text-gray-400 hover:text-white rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-1 text-gray-400 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Budget</span>
                      <span className="text-white">${campaign.budget}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Spend</span>
                      <span className="text-white">${campaign.spend}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">CTR</span>
                      <span className="text-white">{campaign.ctr.toFixed(2)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">ROAS</span>
                      <span className={`font-semibold ${
                        campaign.roas >= 200 ? 'text-green-400' 
                        : campaign.roas >= 100 ? 'text-yellow-400' 
                        : 'text-red-400'
                      }`}>
                        {campaign.roas.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => handleViewDetails(campaign.id)}
                        className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button 
                        onClick={() => handleToggleCampaign(campaign)}
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
              
              {campaigns.length === 0 && (
                <div className="col-span-full">
                  <div className="glass-effect rounded-xl p-12 text-center">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
                    <p className="text-gray-400 mb-6">Create your first campaign to start advertising</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Creatives Tab */}
          {activeTab === 'creatives' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-semibold text-white">AI-Generated Ad Creatives</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      n8nStatus === 'connected' ? 'bg-green-400' : 
                      n8nStatus === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                    }`}></div>
                    <span className="text-xs text-gray-400">
                      {n8nStatus === 'connected' ? 'Enhanced AI Active' : 
                       n8nStatus === 'checking' ? 'Checking...' : 'Basic AI Only'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">Enhanced AI</span>
                    <button
                      onClick={() => setUseEnhancedAI(!useEnhancedAI)}
                      disabled={n8nStatus !== 'connected'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useEnhancedAI && n8nStatus === 'connected' ? 'bg-purple-600' : 'bg-gray-600'
                      } ${n8nStatus !== 'connected' ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useEnhancedAI && n8nStatus === 'connected' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCreativeModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Creative</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {adCreatives.map((creative, index) => (
                  <motion.div
                    key={creative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-purple-400 font-medium">AI Generated</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Confidence:</span>
                        <span className="text-xs text-green-400 font-bold">
                          {Math.round(creative.performance_prediction.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Headline</p>
                        <p className="text-white font-medium">{creative.headline}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-gray-300 text-sm">{creative.description}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Body Text</p>
                        <p className="text-gray-300 text-sm">{creative.body_text}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CTA</p>
                          <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium">
                            {creative.cta_text}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Est. CTR</p>
                          <p className="text-green-400 font-bold">{creative.performance_prediction.estimated_ctr}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {creative.hashtags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleCopyCreative(creative)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCampaign(creative.id)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {adCreatives.length === 0 && (
                  <div className="col-span-full">
                    <div className="glass-effect rounded-xl p-12 text-center">
                      <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No creatives generated yet</h3>
                      <p className="text-gray-400 mb-6">Use AI to generate high-converting ad creatives</p>
                      <button
                        onClick={() => setShowCreativeModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition-colors"
                      >
                        Generate Your First Creative
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              {/* Automation Settings */}
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Automation Settings</h3>
                  </div>
                  <button
                    onClick={optimizeBudgetAllocation}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Optimize Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Auto Bidding</p>
                        <p className="text-sm text-gray-400">Automatically adjust bids for better performance</p>
                      </div>
                      <button
                        onClick={() => updateAutomationSettings({ 
                          enableAutoBidding: !automationSettings.enableAutoBidding 
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          automationSettings.enableAutoBidding ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            automationSettings.enableAutoBidding ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Budget Optimization</p>
                        <p className="text-sm text-gray-400">Reallocate budget to best performers</p>
                      </div>
                      <button
                        onClick={() => updateAutomationSettings({ 
                          enableBudgetOptimization: !automationSettings.enableBudgetOptimization 
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          automationSettings.enableBudgetOptimization ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            automationSettings.enableBudgetOptimization ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Creative Rotation</p>
                        <p className="text-sm text-gray-400">Auto-rotate ad creatives for freshness</p>
                      </div>
                      <button
                        onClick={() => updateAutomationSettings({ 
                          enableCreativeRotation: !automationSettings.enableCreativeRotation 
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          automationSettings.enableCreativeRotation ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            automationSettings.enableCreativeRotation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Audience Expansion</p>
                        <p className="text-sm text-gray-400">Expand audience based on performance</p>
                      </div>
                      <button
                        onClick={() => updateAutomationSettings({ 
                          enableAudienceExpansion: !automationSettings.enableAudienceExpansion 
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          automationSettings.enableAudienceExpansion ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            automationSettings.enableAudienceExpansion ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum CTR (%)
                      </label>
                      <input
                        type="number"
                        value={automationSettings.performanceThresholds.minCTR}
                        onChange={(e) => updateAutomationSettings({
                          performanceThresholds: {
                            ...automationSettings.performanceThresholds,
                            minCTR: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        step="0.1"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Maximum CPC ($)
                      </label>
                      <input
                        type="number"
                        value={automationSettings.performanceThresholds.maxCPC}
                        onChange={(e) => updateAutomationSettings({
                          performanceThresholds: {
                            ...automationSettings.performanceThresholds,
                            maxCPC: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        step="0.1"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum ROAS (%)
                      </label>
                      <input
                        type="number"
                        value={automationSettings.performanceThresholds.minROAS}
                        onChange={(e) => updateAutomationSettings({
                          performanceThresholds: {
                            ...automationSettings.performanceThresholds,
                            minROAS: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        step="10"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Optimization Frequency (hours)
                      </label>
                      <input
                        type="number"
                        value={automationSettings.optimizationFrequency}
                        onChange={(e) => updateAutomationSettings({
                          optimizationFrequency: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="168"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimization Recommendations */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  <span>Optimization Recommendations</span>
                </h3>
                
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">{campaign.name}</p>
                          <p className="text-sm text-gray-400">{campaign.platform}</p>
                        </div>
                        <button 
                          onClick={() => applySuggestedOptimizations(campaign.id)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        {campaign.ctr < 1.0 && (
                          <p className="text-yellow-400">• Consider refreshing ad creatives to improve CTR</p>
                        )}
                        {campaign.cpc > 5.0 && (
                          <p className="text-red-400">• CPC is high - optimize targeting or reduce bid</p>
                        )}
                        {campaign.roas > 300 && (
                          <p className="text-green-400">• High ROAS - consider increasing budget</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* A/B Testing Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Active A/B Tests</h3>
                <button 
                  onClick={handleCreateABTest}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Create Test</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTests.map((test, index) => (
                  <div key={test.test_id} className="glass-effect rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <TestTube className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-white">Test #{index + 1}</span>
                      </div>
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                        Running
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Test Variants</p>
                        <div className="space-y-2">
                          {test.variants.slice(0, 2).map((variant, vIndex) => (
                            <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                              <span className="text-white text-sm">Variant {vIndex + 1}</span>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">Predicted CTR Lift</p>
                                <p className={`text-sm font-medium ${
                                  variant.predicted_performance.ctr_lift > 0 
                                    ? 'text-green-400' 
                                    : 'text-red-400'
                                }`}>
                                  {variant.predicted_performance.ctr_lift > 0 ? '+' : ''}
                                  {variant.predicted_performance.ctr_lift.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-2">Current Winner</p>
                        <p className="text-white">Variant 1</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-2">Recommendations</p>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {test.recommendations.slice(0, 2).map((rec, rIndex) => (
                            <li key={rIndex} className="flex items-start">
                              <span className="text-purple-400 mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeTests.length === 0 && (
                  <div className="col-span-full">
                    <div className="glass-effect rounded-xl p-12 text-center">
                      <TestTube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No active tests</h3>
                      <p className="text-gray-400 mb-6">Create A/B tests to optimize your ad performance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Connected Ad Accounts</h3>
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Connect Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {connectedAccounts.map((account, index) => {
                  const platform = platforms.find(p => p.id === account.platform);
                  return (
                    <div key={account.account_id} className="glass-effect rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${platform?.color || 'bg-gray-600'} rounded-lg flex items-center justify-center text-white text-lg`}>
                            {platform?.icon || '📱'}
                          </div>
                          <div>
                            <p className="font-medium text-white">{account.account_name}</p>
                            <p className="text-sm text-gray-400">{platform?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-green-400">Connected</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Currency:</span>
                          <span className="text-white">{account.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Timezone:</span>
                          <span className="text-white">{account.timezone}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => handleRefreshAccount(account.account_id)}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                          >
                            Refresh Data
                          </button>
                          <button 
                            onClick={() => handleDisconnectAccount(account.account_id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {platforms.filter(p => !connectedAccounts.some(a => a.platform === p.id)).map((platform) => (
                  <div key={platform.id} className="glass-effect rounded-xl p-6 border-2 border-dashed border-gray-600">
                    <div className="text-center">
                      <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-3`}>
                        {platform.icon}
                      </div>
                      <p className="font-medium text-white mb-2">{platform.name}</p>
                      <p className="text-sm text-gray-400 mb-4">Not connected</p>
                      <button
                        onClick={() => handleConnectAccount(platform.id as AdPlatform)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Create New Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Budget ($)
                  </label>
                  <input
                    type="number"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platforms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.slice(0, 6).map((platform) => (
                      <label key={platform.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.id as AdPlatform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlatforms(prev => [...prev, platform.id as AdPlatform]);
                            } else {
                              setSelectedPlatforms(prev => prev.filter(p => p !== platform.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-white text-sm">{platform.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={!campaignForm.name || selectedPlatforms.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creative Generation Modal */}
      <AnimatePresence>
        {showCreativeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Generate AI Creative</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                    <select
                      value={creativeForm.industry}
                      onChange={(e) => setCreativeForm(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                      <option value="education">Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brand Voice</label>
                    <select
                      value={creativeForm.brand_voice}
                      onChange={(e) => setCreativeForm(prev => ({ ...prev, brand_voice: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="playful">Playful</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={creativeForm.target_audience}
                    onChange={(e) => setCreativeForm(prev => ({ ...prev, target_audience: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., business professionals, millennials, tech enthusiasts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product/Service</label>
                  <input
                    type="text"
                    value={creativeForm.product_service}
                    onChange={(e) => setCreativeForm(prev => ({ ...prev, product_service: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="What are you advertising?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Benefits</label>
                  {creativeForm.key_benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...creativeForm.key_benefits];
                          newBenefits[index] = e.target.value;
                          setCreativeForm(prev => ({ ...prev, key_benefits: newBenefits }));
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`Benefit ${index + 1}`}
                      />
                      {creativeForm.key_benefits.length > 1 && (
                        <button
                          onClick={() => {
                            const newBenefits = creativeForm.key_benefits.filter((_, i) => i !== index);
                            setCreativeForm(prev => ({ ...prev, key_benefits: newBenefits }));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setCreativeForm(prev => ({ 
                      ...prev, 
                      key_benefits: [...prev.key_benefits, ''] 
                    }))}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Benefit</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                    <select
                      value={creativeForm.platform}
                      onChange={(e) => setCreativeForm(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="facebook_ads">Facebook</option>
                      <option value="google_ads">Google Ads</option>
                      <option value="instagram_ads">Instagram</option>
                      <option value="linkedin_ads">LinkedIn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CTA</label>
                    <input
                      type="text"
                      value={creativeForm.call_to_action}
                      onChange={(e) => setCreativeForm(prev => ({ ...prev, call_to_action: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreativeModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateCreative}
                  disabled={!creativeForm.product_service || loading.creatives}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {loading.creatives && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Creative</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Connection Modal */}
      <AnimatePresence>
        {showAccountModal && accountToConnect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Connect {platforms.find(p => p.id === accountToConnect)?.name} Account
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter account name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter access token"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAccountModal(false);
                    setAccountToConnect(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await connectAdAccount(accountToConnect, {
                      account_name: `${platforms.find(p => p.id === accountToConnect)?.name} Account`,
                      account_id: `demo_${accountToConnect}_${Date.now()}`
                    });
                    setShowAccountModal(false);
                    setAccountToConnect(null);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Connect Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdCampaignManager;