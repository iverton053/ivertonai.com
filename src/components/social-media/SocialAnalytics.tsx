import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Target,
  Clock,
  Zap,
  Award,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { SocialPlatform, SocialMediaAnalytics, SocialMediaPost } from '../../types/socialMedia';

interface SocialAnalyticsProps {
  analytics: Record<SocialPlatform, SocialMediaAnalytics>;
  posts: SocialMediaPost[];
  selectedPlatforms: SocialPlatform[];
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onPlatformFilter: (platforms: SocialPlatform[]) => void;
  isMobile?: boolean;
}

const SocialAnalytics: React.FC<SocialAnalyticsProps> = ({
  analytics,
  posts,
  selectedPlatforms,
  dateRange,
  onDateRangeChange,
  onPlatformFilter,
  isMobile = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'growth' | 'content'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [exportDateRange, setExportDateRange] = useState('30d');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const platformColors = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0077B5',
    youtube: '#FF0000'
  };

  // Export functionality
  const handleExport = async () => {
    setIsLoading(true);

    try {
      const aggregatedData = getAggregatedData();
      const exportData = {
        summary: aggregatedData,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : Object.keys(analytics),
        dateRange: exportDateRange === 'custom' ? `${customDateFrom} to ${customDateTo}` : exportDateRange,
        generated: new Date().toISOString(),
        posts: posts.slice(0, 50), // Limit posts for export
        topHashtags: getTopHashtags(),
        performanceMetrics: getPerformanceMetrics()
      };

      switch (exportFormat) {
        case 'csv':
          downloadCSV(exportData);
          break;
        case 'xlsx':
          downloadExcel(exportData);
          break;
        case 'pdf':
          downloadPDF(exportData);
          break;
      }

      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = (data: any) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `social_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const downloadExcel = (data: any) => {
    // Mock Excel download - would integrate with library like xlsx
    console.log('Excel export functionality would be implemented here', data);
    alert('Excel export feature coming soon!');
  };

  const downloadPDF = (data: any) => {
    // Mock PDF download - would integrate with library like jsPDF
    console.log('PDF export functionality would be implemented here', data);
    alert('PDF export feature coming soon!');
  };

  const convertToCSV = (data: any) => {
    const headers = ['Metric', 'Value', 'Platform', 'Date'];
    const rows = [
      ['Total Posts', data.summary.totalPosts, 'All', new Date().toISOString().split('T')[0]],
      ['Total Engagement', data.summary.totalEngagement, 'All', new Date().toISOString().split('T')[0]],
      ['Total Reach', data.summary.totalReach, 'All', new Date().toISOString().split('T')[0]],
      ['Total Impressions', data.summary.totalImpressions, 'All', new Date().toISOString().split('T')[0]],
      ['Engagement Rate', `${data.summary.engagementRate.toFixed(2)}%`, 'All', new Date().toISOString().split('T')[0]]
    ];

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const getTopHashtags = () => {
    const hashtags: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        hashtags[tag] = (hashtags[tag] || 0) + 1;
      });
    });
    return Object.entries(hashtags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  };

  const getPerformanceMetrics = () => {
    return posts.map(post => ({
      id: post.id,
      platform: post.platform,
      engagement: (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0),
      reach: post.metrics?.reach || 0,
      impressions: post.metrics?.impressions || 0,
      publishedAt: post.publishedAt
    })).filter(post => post.publishedAt);
  };

  // Aggregate data across selected platforms
  const getAggregatedData = () => {
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : Object.keys(analytics) as SocialPlatform[];
    
    return platforms.reduce((acc, platform) => {
      const platformData = analytics[platform];
      if (!platformData) return acc;
      
      return {
        totalPosts: acc.totalPosts + platformData.overview.totalPosts,
        totalEngagement: acc.totalEngagement + platformData.overview.totalEngagement,
        totalReach: acc.totalReach + platformData.overview.totalReach,
        totalImpressions: acc.totalImpressions + platformData.overview.totalImpressions,
        averageEngagementRate: (acc.averageEngagementRate + platformData.overview.engagementRate) / 2,
        followerGrowth: acc.followerGrowth + platformData.growth.followerGrowth,
        engagementGrowth: acc.engagementGrowth + platformData.growth.engagementGrowth
      };
    }, {
      totalPosts: 0,
      totalEngagement: 0,
      totalReach: 0,
      totalImpressions: 0,
      averageEngagementRate: 0,
      followerGrowth: 0,
      engagementGrowth: 0
    });
  };

  const aggregatedData = getAggregatedData();

  // Generate performance data for charts
  const getPerformanceData = () => {
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : Object.keys(analytics) as SocialPlatform[];
    const daysCount = parseInt(dateRange.replace('d', ''));
    const dates = Array.from({ length: daysCount }, (_, i) => 
      format(subDays(new Date(), daysCount - 1 - i), 'MMM dd')
    );

    return dates.map(date => {
      const dataPoint: any = { date };
      let totalEngagement = 0;
      let totalReach = 0;
      let totalImpressions = 0;

      platforms.forEach(platform => {
        const platformData = analytics[platform];
        if (platformData) {
          const dayData = platformData.performanceData.find(d => 
            format(new Date(d.date), 'MMM dd') === date
          );
          
          if (dayData) {
            dataPoint[`${platform}_engagement`] = dayData.engagement;
            dataPoint[`${platform}_reach`] = dayData.reach;
            dataPoint[`${platform}_impressions`] = dayData.impressions;
            
            totalEngagement += dayData.engagement;
            totalReach += dayData.reach;
            totalImpressions += dayData.impressions;
          }
        }
      });

      dataPoint.totalEngagement = totalEngagement;
      dataPoint.totalReach = totalReach;
      dataPoint.totalImpressions = totalImpressions;

      return dataPoint;
    });
  };

  const performanceData = getPerformanceData();

  // Get platform distribution data
  const getPlatformDistribution = () => {
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : Object.keys(analytics) as SocialPlatform[];
    
    return platforms.map(platform => ({
      name: platform,
      value: analytics[platform]?.overview.totalEngagement || 0,
      color: platformColors[platform]
    }));
  };

  const platformDistribution = getPlatformDistribution();

  // Get top performing posts
  const getTopPosts = () => {
    return posts
      .filter(post => 
        (selectedPlatforms.length === 0 || selectedPlatforms.includes(post.platform)) &&
        post.metrics
      )
      .sort((a, b) => {
        const aEngagement = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0);
        const bEngagement = (b.metrics?.likes || 0) + (b.metrics?.comments || 0) + (b.metrics?.shares || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 5);
  };

  const topPosts = getTopPosts();

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    format = 'number' 
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ComponentType<any>;
    color?: string;
    format?: 'number' | 'percentage';
  }) => {
    const formatValue = (val: number) => {
      if (format === 'percentage') return `${val.toFixed(1)}%`;
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`glass-effect rounded-xl ${isMobile ? 'p-4' : 'p-6'} shadow-sm border`}
      >
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className={`${isMobile ? 'p-2' : 'p-3'} rounded-lg bg-${color}-100`}>
            <Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-${color}-600`} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>{formatValue(value)}</p>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>{title}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
        <div>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>Analytics Overview</h2>
          <p className={`${isMobile ? 'text-sm' : ''} text-gray-400`}>Track your social media performance</p>
        </div>
        
        <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-3'}`}>
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className={`${isMobile ? 'w-full' : ''} px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-white`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Platform Filter */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Platforms</span>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-64 glass-effect rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="p-4">
                <h3 className="font-medium text-white mb-3">Filter by Platform</h3>
                <div className="space-y-2">
                  {(Object.keys(analytics) as SocialPlatform[]).map(platform => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onPlatformFilter([...selectedPlatforms, platform]);
                          } else {
                            onPlatformFilter(selectedPlatforms.filter(p => p !== platform));
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                      <span className="capitalize text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => onPlatformFilter([])}
                  className="w-full mt-3 px-3 py-1 text-sm text-purple-400 hover:text-purple-300"
                >
                  Show All Platforms
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportModal(true)}
              className={`flex items-center ${isMobile ? 'justify-center w-full' : 'space-x-2'} px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
            >
              <Download className="w-4 h-4" />
              <span className={`${isMobile ? 'ml-2' : ''}`}>Export</span>
            </button>

            {/* Export Modal */}
            {showExportModal && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Export Analytics</h3>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Export Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx' | 'pdf')}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="csv">CSV (Spreadsheet)</option>
                        <option value="xlsx">Excel (XLSX)</option>
                        <option value="pdf">PDF Report</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                      <select
                        value={exportDateRange}
                        onChange={(e) => setExportDateRange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {exportDateRange === 'custom' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">From</label>
                          <input
                            type="date"
                            value={customDateFrom}
                            onChange={(e) => setCustomDateFrom(e.target.value)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">To</label>
                          <input
                            type="date"
                            value={customDateTo}
                            onChange={(e) => setCustomDateTo(e.target.value)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Platform Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Include Platforms</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(analytics).map(platform => (
                          <label key={platform} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedPlatforms.length === 0 || selectedPlatforms.includes(platform as SocialPlatform)}
                              onChange={(e) => {
                                // Platform selection logic here
                              }}
                              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-300 capitalize">{platform}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Export Button */}
                    <button
                      onClick={() => handleExport()}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Export {exportFormat.toUpperCase()}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`${isMobile ? 'grid grid-cols-2 gap-1' : 'flex space-x-1'} bg-gray-800 p-1 rounded-lg`}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'engagement', label: 'Engagement', icon: Heart },
          { id: 'growth', label: 'Growth', icon: TrendingUp },
          { id: 'content', label: 'Content', icon: Target }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center ${isMobile ? 'justify-center' : 'space-x-2'} ${isMobile ? 'px-2 py-3' : 'px-4 py-2'} rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'glass-effect text-purple-400 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className={`${isMobile ? 'ml-1 text-xs' : ''}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
            <StatCard
              title="Total Posts"
              value={aggregatedData.totalPosts}
              icon={BarChart3}
              color="blue"
            />
            <StatCard
              title="Total Engagement"
              value={aggregatedData.totalEngagement}
              change={aggregatedData.engagementGrowth}
              icon={Heart}
              color="pink"
            />
            <StatCard
              title="Total Reach"
              value={aggregatedData.totalReach}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Avg. Engagement Rate"
              value={aggregatedData.averageEngagementRate}
              icon={Target}
              color="purple"
              format="percentage"
            />
          </div>

          {/* Performance Chart */}
          <div className={`glass-effect rounded-xl ${isMobile ? 'p-4' : 'p-6'} shadow-sm border`}>
            <div className={`${isMobile ? 'space-y-3 mb-4' : 'flex items-center justify-between mb-6'}`}>
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white`}>Performance Trend</h3>
              <div className={`${isMobile ? 'flex flex-wrap gap-2' : 'flex items-center space-x-4'}`}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-400">Engagement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-400">Reach</span>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalEngagement"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="totalReach"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
            <div className={`glass-effect rounded-xl ${isMobile ? 'p-4' : 'p-6'} shadow-sm border`}>
              <h3 className={`${isMobile ? 'text-base mb-4' : 'text-lg mb-6'} font-semibold text-white`}>Platform Distribution</h3>
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {platformDistribution.map(platform => (
                  <div key={platform.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    ></div>
                    <span className="text-sm text-gray-400 capitalize">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`glass-effect rounded-xl ${isMobile ? 'p-4' : 'p-6'} shadow-sm border`}>
              <h3 className={`${isMobile ? 'text-base mb-4' : 'text-lg mb-6'} font-semibold text-white`}>Top Performing Posts</h3>
              <div className="space-y-4">
                {topPosts.map((post, index) => {
                  const engagement = (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0);
                  return (
                    <div key={post.id} className={`flex items-start ${isMobile ? 'space-x-2 p-2' : 'space-x-3 p-3'} hover:bg-gray-700/50 rounded-lg transition-colors`}>
                      <div className={`${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} rounded-lg flex items-center justify-center text-white font-bold`}
                           style={{ backgroundColor: platformColors[post.platform] }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white truncate`}>
                          {post.content.substring(0, isMobile ? 40 : 60)}...
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.metrics?.likes || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.metrics?.comments || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Share2 className="w-3 h-3" />
                            <span>{post.metrics?.shares || 0}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{engagement.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">engagement</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Likes"
              value={posts.reduce((sum, post) => sum + (post.metrics?.likes || 0), 0)}
              icon={Heart}
              color="red"
            />
            <StatCard
              title="Total Comments"
              value={posts.reduce((sum, post) => sum + (post.metrics?.comments || 0), 0)}
              icon={MessageCircle}
              color="blue"
            />
            <StatCard
              title="Total Shares"
              value={posts.reduce((sum, post) => sum + (post.metrics?.shares || 0), 0)}
              icon={Share2}
              color="green"
            />
          </div>

          <div className="glass-effect rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-white mb-6">Engagement Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalEngagement" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Growth Tab */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Follower Growth"
              value={aggregatedData.followerGrowth}
              change={15.3}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Engagement Growth"
              value={aggregatedData.engagementGrowth}
              change={8.7}
              icon={TrendingUp}
              color="blue"
              format="percentage"
            />
          </div>

          <div className="glass-effect rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-white mb-6">Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="totalReach" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Published Posts"
              value={posts.filter(p => p.status === 'published').length}
              icon={Award}
              color="green"
            />
            <StatCard
              title="Scheduled Posts"
              value={posts.filter(p => p.status === 'scheduled').length}
              icon={Clock}
              color="blue"
            />
            <StatCard
              title="Draft Posts"
              value={posts.filter(p => p.status === 'draft').length}
              icon={FileText}
              color="gray"
            />
          </div>

          <div className="glass-effect rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-white mb-6">Content Performance</h3>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`}
                         style={{ backgroundColor: platformColors[post.platform] }}>
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{post.content.substring(0, 80)}...</p>
                      <p className="text-sm text-gray-400 capitalize">{post.platform} • {post.mediaType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {((post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAnalytics;