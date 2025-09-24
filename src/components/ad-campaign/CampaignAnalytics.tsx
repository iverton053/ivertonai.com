import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Eye,
  MousePointer, ShoppingCart, DollarSign, Users, Clock, Calendar,
  Filter, Download, Share2, RefreshCw, Settings, Maximize2,
  Target, Zap, Award, AlertCircle, Info, ArrowUp, ArrowDown,
  MapPin, Smartphone, Monitor, Tablet, Globe, Star, Percent,
  Activity, CreditCard, Layers, Search, ChevronDown, ChevronUp,
  ExternalLink, Lightbulb, Flag, BookOpen, Database, FileText,
  MessageSquare, ThumbsUp, Heart, Repeat, PlayCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend
} from 'recharts';

interface CampaignAnalyticsProps {
  campaignId?: string;
  dateRange?: { start: string; end: string };
  onDataExport?: (data: any) => void;
}

interface AnalyticsData {
  overview: OverviewMetrics;
  performance: PerformanceData[];
  demographics: DemographicData;
  devices: DeviceData[];
  locations: LocationData[];
  timeline: TimelineData[];
  conversion: ConversionData;
  attribution: AttributionData[];
}

interface OverviewMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  reach: number;
  frequency: number;
}

interface PerformanceData {
  campaign: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  status: 'active' | 'paused' | 'completed';
}

interface DemographicData {
  age: { range: string; percentage: number; performance: number }[];
  gender: { type: string; percentage: number; performance: number }[];
  interests: { category: string; percentage: number; performance: number }[];
}

interface DeviceData {
  type: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
}

interface LocationData {
  location: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  performance: number;
}

interface TimelineData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
}

interface ConversionData {
  funnel: { stage: string; visitors: number; conversion_rate: number }[];
  attribution: { channel: string; conversions: number; value: number }[];
  path: { path: string; conversions: number; value: number }[];
}

interface AttributionData {
  touchpoint: string;
  first_touch: number;
  last_touch: number;
  linear: number;
  time_decay: number;
}

const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({
  campaignId,
  dateRange,
  onDataExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('conversions');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockData: AnalyticsData = {
        overview: {
          impressions: 2450000,
          clicks: 68420,
          conversions: 1847,
          spend: 12500,
          ctr: 2.79,
          cpc: 0.18,
          cpa: 6.77,
          roas: 4.2,
          reach: 890000,
          frequency: 2.75
        },
        performance: [
          {
            campaign: 'Holiday Sale 2024',
            impressions: 850000,
            clicks: 28500,
            conversions: 785,
            spend: 4200,
            ctr: 3.35,
            cpc: 0.15,
            cpa: 5.35,
            roas: 5.2,
            status: 'active'
          },
          {
            campaign: 'Brand Awareness Q4',
            impressions: 1200000,
            clicks: 24000,
            conversions: 480,
            spend: 3800,
            ctr: 2.0,
            cpc: 0.16,
            cpa: 7.92,
            roas: 3.8,
            status: 'active'
          },
          {
            campaign: 'Product Launch',
            impressions: 400000,
            clicks: 15920,
            conversions: 582,
            spend: 4500,
            ctr: 3.98,
            cpc: 0.28,
            cpa: 7.73,
            roas: 4.6,
            status: 'paused'
          }
        ],
        demographics: {
          age: [
            { range: '18-24', percentage: 25, performance: 3.2 },
            { range: '25-34', percentage: 35, performance: 4.1 },
            { range: '35-44', percentage: 22, performance: 3.8 },
            { range: '45-54', percentage: 12, performance: 2.9 },
            { range: '55+', percentage: 6, performance: 2.1 }
          ],
          gender: [
            { type: 'Female', percentage: 58, performance: 3.8 },
            { type: 'Male', percentage: 40, performance: 3.2 },
            { type: 'Other', percentage: 2, performance: 2.9 }
          ],
          interests: [
            { category: 'Shopping & Fashion', percentage: 28, performance: 4.2 },
            { category: 'Technology', percentage: 22, performance: 3.9 },
            { category: 'Health & Fitness', percentage: 18, performance: 3.5 },
            { category: 'Travel', percentage: 15, performance: 4.0 },
            { category: 'Food & Dining', percentage: 17, performance: 3.1 }
          ]
        },
        devices: [
          {
            type: 'Mobile',
            impressions: 1470000,
            clicks: 48000,
            conversions: 1200,
            spend: 7800,
            ctr: 3.27,
            cpc: 0.16
          },
          {
            type: 'Desktop',
            impressions: 735000,
            clicks: 16420,
            conversions: 485,
            spend: 3200,
            ctr: 2.23,
            cpc: 0.19
          },
          {
            type: 'Tablet',
            impressions: 245000,
            clicks: 4000,
            conversions: 162,
            spend: 1500,
            ctr: 1.63,
            cpc: 0.38
          }
        ],
        locations: [
          {
            location: 'United States',
            impressions: 1200000,
            clicks: 38000,
            conversions: 950,
            spend: 6200,
            performance: 4.1
          },
          {
            location: 'Canada',
            impressions: 400000,
            clicks: 12500,
            conversions: 385,
            spend: 2100,
            performance: 3.8
          },
          {
            location: 'United Kingdom',
            impressions: 350000,
            clicks: 9800,
            conversions: 280,
            spend: 1900,
            performance: 3.5
          },
          {
            location: 'Australia',
            impressions: 300000,
            clicks: 5120,
            conversions: 132,
            spend: 1300,
            performance: 2.9
          },
          {
            location: 'Germany',
            impressions: 200000,
            clicks: 3000,
            conversions: 100,
            spend: 1000,
            performance: 2.7
          }
        ],
        timeline: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          impressions: Math.floor(Math.random() * 100000) + 50000,
          clicks: Math.floor(Math.random() * 3000) + 1000,
          conversions: Math.floor(Math.random() * 100) + 20,
          spend: Math.floor(Math.random() * 500) + 200,
          ctr: Math.random() * 2 + 1.5,
          cpc: Math.random() * 0.3 + 0.1
        })),
        conversion: {
          funnel: [
            { stage: 'Impressions', visitors: 2450000, conversion_rate: 100 },
            { stage: 'Clicks', visitors: 68420, conversion_rate: 2.79 },
            { stage: 'Landing Page', visitors: 62000, conversion_rate: 90.6 },
            { stage: 'Product View', visitors: 28500, conversion_rate: 46.0 },
            { stage: 'Add to Cart', visitors: 8500, conversion_rate: 29.8 },
            { stage: 'Checkout', visitors: 3200, conversion_rate: 37.6 },
            { stage: 'Purchase', visitors: 1847, conversion_rate: 57.7 }
          ],
          attribution: [
            { channel: 'Paid Search', conversions: 680, value: 34000 },
            { channel: 'Social Media', conversions: 520, value: 26000 },
            { channel: 'Display', conversions: 385, value: 19250 },
            { channel: 'Email', conversions: 162, value: 8100 },
            { channel: 'Direct', conversions: 100, value: 5000 }
          ],
          path: [
            { path: 'Social → Direct', conversions: 485, value: 24250 },
            { path: 'Search → Social → Direct', conversions: 320, value: 16000 },
            { path: 'Display → Search', conversions: 280, value: 14000 },
            { path: 'Email → Direct', conversions: 180, value: 9000 },
            { path: 'Social → Search → Direct', conversions: 150, value: 7500 }
          ]
        },
        attribution: [
          {
            touchpoint: 'Facebook Ads',
            first_touch: 45,
            last_touch: 35,
            linear: 40,
            time_decay: 42
          },
          {
            touchpoint: 'Google Ads',
            first_touch: 35,
            last_touch: 45,
            linear: 35,
            time_decay: 38
          },
          {
            touchpoint: 'Instagram Ads',
            first_touch: 20,
            last_touch: 20,
            linear: 25,
            time_decay: 20
          }
        ]
      };

      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [selectedDateRange, campaignId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const getMetricValue = (metric: string, data: any) => {
    switch (metric) {
      case 'impressions':
      case 'clicks':
      case 'conversions':
        return formatNumber(data[metric]);
      case 'spend':
      case 'cpc':
      case 'cpa':
        return formatCurrency(data[metric]);
      case 'ctr':
        return formatPercentage(data[metric]);
      case 'roas':
        return `${data[metric].toFixed(2)}x`;
      default:
        return data[metric];
    }
  };

  const getChangeDirection = (change: number) => {
    if (change > 0) return { icon: ArrowUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (change < 0) return { icon: ArrowDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' };
    return { icon: ArrowUp, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' };
  };

  const exportData = () => {
    if (data && onDataExport) {
      onDataExport(data);
    }
    // Simulate download
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `campaign-analytics-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'audience', name: 'Audience', icon: Users },
    { id: 'devices', name: 'Devices & Locations', icon: Smartphone },
    { id: 'conversion', name: 'Conversion Path', icon: Target },
    { id: 'attribution', name: 'Attribution', icon: Award }
  ];

  const dateRangeOptions = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const metricOptions = [
    { value: 'impressions', label: 'Impressions', icon: Eye },
    { value: 'clicks', label: 'Clicks', icon: MousePointer },
    { value: 'conversions', label: 'Conversions', icon: ShoppingCart },
    { value: 'spend', label: 'Spend', icon: DollarSign },
    { value: 'ctr', label: 'CTR', icon: Target },
    { value: 'cpc', label: 'CPC', icon: CreditCard },
    { value: 'roas', label: 'ROAS', icon: TrendingUp }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Campaign Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive performance insights and optimization recommendations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Filter className="w-5 h-5" />
          </button>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Metric
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {metricOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compare Mode
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compareMode}
                    onChange={(e) => setCompareMode(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Compare campaigns
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { key: 'impressions', label: 'Impressions', icon: Eye, change: 12.5 },
          { key: 'clicks', label: 'Clicks', icon: MousePointer, change: 8.3 },
          { key: 'conversions', label: 'Conversions', icon: ShoppingCart, change: 15.7 },
          { key: 'spend', label: 'Spend', icon: DollarSign, change: -5.2 },
          { key: 'ctr', label: 'CTR', icon: Target, change: 3.1 },
          { key: 'roas', label: 'ROAS', icon: TrendingUp, change: 22.4 }
        ].map((metric, index) => {
          const changeData = getChangeDirection(metric.change);
          const ChangeIcon = changeData.icon;

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <metric.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${changeData.bg}`}>
                  <ChangeIcon className={`w-3 h-3 ${changeData.color}`} />
                  <span className={changeData.color}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {getMetricValue(metric.key, data.overview)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metric.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    Performance Timeline
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {metricOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: any) => [getMetricValue(selectedMetric, { [selectedMetric]: value }), selectedMetric.toUpperCase()]}
                      />
                      <Line
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#3B82F6' }}
                        activeDot={{ r: 6, fill: '#3B82F6' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Campaign Performance Comparison */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Campaign Performance Comparison
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="campaign"
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any) => [formatNumber(value), 'Conversions']}
                      />
                      <Bar dataKey="conversions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    Campaign Performance Details
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Impressions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Conversions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Spend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          CTR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          CPA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          ROAS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data.performance.map((campaign, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {campaign.campaign}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatNumber(campaign.impressions)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatNumber(campaign.clicks)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {campaign.conversions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(campaign.spend)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatPercentage(campaign.ctr)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(campaign.cpa)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {campaign.roas.toFixed(2)}x
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                              campaign.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : campaign.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Audience Tab */}
          {activeTab === 'audience' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Demographics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Age Demographics
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.demographics.age}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="range" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Bar dataKey="percentage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Gender Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={data.demographics.gender}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {data.demographics.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interest Categories */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Top Interest Categories
                </h3>
                <div className="space-y-4">
                  {data.demographics.interests.map((interest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {interest.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {interest.percentage}% of audience
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {interest.performance}x performance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Devices & Locations Tab */}
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Device Performance
                </h3>
                <div className="space-y-4">
                  {data.devices.map((device, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {device.type === 'Mobile' && <Smartphone className="w-5 h-5 text-blue-500" />}
                          {device.type === 'Desktop' && <Monitor className="w-5 h-5 text-blue-500" />}
                          {device.type === 'Tablet' && <Tablet className="w-5 h-5 text-blue-500" />}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {device.type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatPercentage(device.ctr)} CTR
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Impressions</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatNumber(device.impressions)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Conversions</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {device.conversions}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">Clicks</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatNumber(device.clicks)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 dark:text-gray-400">CPC</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(device.cpc)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Top Performing Locations
                </h3>
                <div className="space-y-3">
                  {data.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {location.location}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {location.conversions} conversions
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {location.performance}x performance
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversion Path Tab */}
          {activeTab === 'conversion' && (
            <div className="space-y-6">
              {/* Conversion Funnel */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                  Conversion Funnel
                </h3>
                <div className="space-y-4">
                  {data.conversion.funnel.map((stage, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium text-gray-900 dark:text-white">
                        {stage.stage}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatNumber(stage.visitors)} users
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPercentage(stage.conversion_rate)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stage.conversion_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Attribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                    Attribution by Channel
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={data.conversion.attribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ channel, conversions }) => `${channel}: ${conversions}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="conversions"
                        >
                          {data.conversion.attribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                    Top Conversion Paths
                  </h3>
                  <div className="space-y-3">
                    {data.conversion.path.map((path, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {path.path}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {path.conversions} conversions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(path.value)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Total value
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attribution Tab */}
          {activeTab === 'attribution' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-6">
                Attribution Model Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        Touchpoint
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        First Touch
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        Last Touch
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        Linear
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                        Time Decay
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.attribution.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.touchpoint}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.first_touch}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.last_touch}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.linear}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.time_decay}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                      Attribution Insights
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Facebook Ads shows stronger last-touch attribution, indicating good conversion assist</li>
                      <li>• Google Ads performs well in first-touch, suggesting effective awareness generation</li>
                      <li>• Consider rebalancing budget based on linear attribution model for more balanced view</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CampaignAnalytics;