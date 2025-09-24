// Client Portal Widget - Individual widget component for client portals

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Globe,
  Search,
  Users,
  Eye,
  Target,
  Activity,
  Calendar,
  Download,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Funnel,
  FunnelChart
} from 'recharts';
import { PortalWidgetData, ClientPortal } from '../../types/clientPortal';
import { format } from 'date-fns';

interface ClientPortalWidgetProps {
  widget: PortalWidgetData;
  portal: ClientPortal;
  dateRange: string;
}

const ClientPortalWidget: React.FC<ClientPortalWidgetProps> = ({ 
  widget, 
  portal, 
  dateRange 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getWidgetIcon = () => {
    switch (widget.widget_type) {
      case 'overview_stats':
        return <BarChart3 className="w-5 h-5" />;
      case 'seo_rankings':
        return <TrendingUp className="w-5 h-5" />;
      case 'website_traffic':
        return <Globe className="w-5 h-5" />;
      case 'keyword_performance':
        return <Search className="w-5 h-5" />;
      case 'backlink_growth':
        return <ExternalLink className="w-5 h-5" />;
      case 'social_media_metrics':
        return <Users className="w-5 h-5" />;
      case 'content_performance':
        return <Activity className="w-5 h-5" />;
      case 'competitor_analysis':
        return <Target className="w-5 h-5" />;
      case 'goals_progress':
        return <Eye className="w-5 h-5" />;
      default:
        return <PieChart className="w-5 h-5" />;
    }
  };

  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case 'overview_stats':
        return renderOverviewStats();
      case 'seo_rankings':
        return renderSEORankings();
      case 'website_traffic':
        return renderWebsiteTraffic();
      case 'keyword_performance':
        return renderKeywordPerformance();
      case 'backlink_growth':
        return renderBacklinkGrowth();
      case 'social_media_metrics':
        return renderSocialMediaMetrics();
      case 'content_performance':
        return renderContentPerformance();
      case 'competitor_analysis':
        return renderCompetitorAnalysis();
      case 'goals_progress':
        return renderGoalsProgress();
      default:
        return renderDefaultWidget();
    }
  };

  const renderOverviewStats = () => {
    const data = widget.data;
    if (!data) return renderNoData();

    const stats = [
      { 
        label: 'Total Visitors', 
        value: data.total_visitors || 0, 
        change: '+12.5%', 
        positive: true,
        icon: <Eye className="w-4 h-4" />
      },
      { 
        label: 'Organic Traffic', 
        value: data.organic_traffic || 0, 
        change: '+8.2%', 
        positive: true,
        icon: <Globe className="w-4 h-4" />
      },
      { 
        label: 'Keywords Ranked', 
        value: data.keyword_rankings || 0, 
        change: '+15', 
        positive: true,
        icon: <Search className="w-4 h-4" />
      },
      { 
        label: 'Backlinks', 
        value: data.backlinks || 0, 
        change: '+142', 
        positive: true,
        icon: <ExternalLink className="w-4 h-4" />
      }
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400">{stat.icon}</div>
              <div className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSEORankings = () => {
    const data = widget.data;
    if (!data) return renderNoData();

    const chartData = [
      { name: 'Top 3', value: data.top_10_keywords || 23, fill: '#10b981' },
      { name: 'Top 10', value: data.improved_rankings || 45, fill: '#3b82f6' },
      { name: 'Top 50', value: data.declined_rankings || 88, fill: '#f59e0b' },
      { name: 'Beyond 50', value: data.total_tracked - (data.top_10_keywords + data.improved_rankings + data.declined_rankings) || 12, fill: '#ef4444' }
    ];

    return (
      <div>
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.total_tracked || 156}
          </div>
          <div className="text-sm text-gray-400">Keywords Tracked</div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderWebsiteTraffic = () => {
    const data = widget.data;
    if (!data || !data.traffic_data) return renderNoData();

    return (
      <div>
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.total_sessions?.toLocaleString() || '12,547'}
          </div>
          <div className="text-sm text-gray-400">Total Sessions</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">+12.5% from last period</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.traffic_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="sessions" 
              stroke={portal.theme.primary_color}
              fill={portal.theme.primary_color}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderKeywordPerformance = () => {
    const data = widget.data;
    if (!data || !data.keywords) return renderNoData();

    return (
      <div>
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Top Keywords</div>
          <div className="space-y-2">
            {data.keywords.slice(0, 5).map((keyword: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{keyword.term}</div>
                  <div className="text-sm text-gray-400">Position {keyword.position}</div>
                </div>
                <div className={`text-sm font-medium ${keyword.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {keyword.change >= 0 ? '+' : ''}{keyword.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBacklinkGrowth = () => {
    const data = widget.data;
    if (!data || !data.growth_data) return renderNoData();

    return (
      <div>
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.total_backlinks?.toLocaleString() || '2,841'}
          </div>
          <div className="text-sm text-gray-400">Total Backlinks</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">+142 this month</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.growth_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="backlinks" 
              stroke={portal.theme.secondary_color}
              strokeWidth={2}
              dot={{ fill: portal.theme.secondary_color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderSocialMediaMetrics = () => {
    const data = widget.data;
    if (!data) return renderNoData();

    const platforms = [
      { name: 'Facebook', followers: data.facebook_followers || 12500, engagement: 4.2 },
      { name: 'Instagram', followers: data.instagram_followers || 8900, engagement: 6.8 },
      { name: 'Twitter', followers: data.twitter_followers || 5400, engagement: 3.1 },
      { name: 'LinkedIn', followers: data.linkedin_followers || 3200, engagement: 5.5 }
    ];

    return (
      <div className="space-y-4">
        {platforms.map((platform, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">{platform.name}</div>
              <div className="text-sm text-gray-400">
                {platform.followers.toLocaleString()} followers
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{platform.engagement}%</div>
              <div className="text-sm text-gray-400">engagement</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContentPerformance = () => {
    const data = widget.data;
    if (!data || !data.content_items) return renderNoData();

    return (
      <div>
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Top Content</div>
          <div className="space-y-2">
            {data.content_items.slice(0, 4).map((item: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1 truncate">
                  {item.title}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{item.views} views</span>
                  <span>{item.engagement_rate}% engagement</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCompetitorAnalysis = () => {
    const data = widget.data;
    if (!data || !data.competitors) return renderNoData();

    return (
      <div>
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900 mb-2">Competitor Comparison</div>
          <div className="space-y-3">
            {data.competitors.slice(0, 3).map((competitor: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{competitor.name}</div>
                  <div className={`text-sm font-medium ${competitor.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {competitor.performance >= 0 ? '+' : ''}{competitor.performance}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${competitor.market_share}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {competitor.market_share}% market share
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGoalsProgress = () => {
    const data = widget.data;
    if (!data || !data.goals) return renderNoData();

    return (
      <div className="space-y-4">
        {data.goals.map((goal: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900">{goal.name}</div>
              <div className="text-sm text-gray-400">{goal.progress}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">
              {goal.current} / {goal.target} {goal.unit}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultWidget = () => {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          {getWidgetIcon()}
        </div>
        <p className="text-gray-400">Widget content will appear here</p>
      </div>
    );
  };

  const renderNoData = () => {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-400 mb-2">No data available</p>
        <p className="text-sm text-gray-400">Data will appear once it's collected</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200"
    >
      {/* Widget Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${portal.theme.primary_color}15` }}
            >
              <div style={{ color: portal.theme.primary_color }}>
                {getWidgetIcon()}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{widget.config.title}</h3>
              {widget.config.description && (
                <p className="text-sm text-gray-400">{widget.config.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-gray-400 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-400 transition-colors"
              title="View details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-400 mb-4">
          Last updated: {format(new Date(widget.last_updated), 'MMM dd, yyyy at h:mm a')}
        </div>

        {/* Widget Content */}
        <div className="min-h-[200px]">
          {renderWidgetContent()}
        </div>

        {/* Widget Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border-t"
          >
            <div className="text-sm text-gray-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Refresh Rate:</span> {widget.config.refresh_rate} min
                </div>
                <div>
                  <span className="font-medium">Date Range:</span> {dateRange}
                </div>
              </div>
              {widget.error && (
                <div className="mt-2 text-red-600">
                  Error: {widget.error}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ClientPortalWidget;