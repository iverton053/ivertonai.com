import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Download, Eye, Calendar, Users,
  Filter, RefreshCw, ArrowUp, ArrowDown, Target, Activity
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { BrandAsset, AssetUsageContext, BrandAssetType } from '../../types/brandAssets';

interface AnalyticsFilter {
  timeRange: '7d' | '30d' | '90d' | '1y';
  assetType?: BrandAssetType;
  context?: AssetUsageContext;
  clientId?: string;
}

const BrandAssetAnalytics: React.FC = () => {
  const { assets, analytics, activeClient } = useBrandAssetsStore();
  const [filters, setFilters] = useState<AnalyticsFilter>({
    timeRange: '30d'
  });
  const [selectedMetric, setSelectedMetric] = useState<'downloads' | 'views' | 'usage'>('downloads');

  // Calculate filtered analytics based on current filters
  const filteredAnalytics = useMemo(() => {
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };

    const cutoffDate = new Date(now.getTime() - timeRangeMs[filters.timeRange]);
    
    let filteredAssets = assets.filter(asset => {
      if (filters.clientId && asset.clientId !== filters.clientId) return false;
      if (filters.assetType && asset.type !== filters.assetType) return false;
      if (asset.lastUsed && asset.lastUsed < cutoffDate) return false;
      return true;
    });

    // Calculate metrics
    const totalDownloads = filteredAssets.reduce((sum, asset) => sum + asset.totalDownloads, 0);
    const totalAssets = filteredAssets.length;
    const approvedAssets = filteredAssets.filter(asset => asset.isApproved).length;
    const complianceRate = totalAssets > 0 ? Math.round((approvedAssets / totalAssets) * 100) : 0;

    // Asset type distribution
    const assetsByType: Record<BrandAssetType, number> = {} as any;
    filteredAssets.forEach(asset => {
      assetsByType[asset.type] = (assetsByType[asset.type] || 0) + 1;
    });

    // Top performing assets
    const topAssets = [...filteredAssets]
      .sort((a, b) => b.totalDownloads - a.totalDownloads)
      .slice(0, 10);

    // Usage trends (mock data for demonstration)
    const generateTrendData = (days: number) => {
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: date.toISOString().split('T')[0],
          downloads: Math.floor(Math.random() * 50) + 10,
          views: Math.floor(Math.random() * 200) + 50,
          uploads: Math.floor(Math.random() * 5) + 1
        });
      }
      return data;
    };

    const trendData = generateTrendData(
      filters.timeRange === '7d' ? 7 :
      filters.timeRange === '30d' ? 30 :
      filters.timeRange === '90d' ? 90 : 365
    );

    return {
      totalDownloads,
      totalAssets,
      complianceRate,
      assetsByType,
      topAssets,
      trendData,
      averageDownloads: totalAssets > 0 ? Math.round(totalDownloads / totalAssets) : 0
    };
  }, [assets, filters]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getAssetIcon = (type: BrandAssetType) => {
    const icons = {
      'logo': '🏢',
      'icon': '⭐',
      'color-palette': '🎨',
      'font': '🔤',
      'template': '📄',
      'image': '🖼️',
      'video': '🎥',
      'document': '📋',
      'guideline': '📖'
    };
    return icons[type] || '📁';
  };

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    change?: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }> = ({ title, value, change, icon, color, suffix = '' }) => (
    <div className={`bg-gradient-to-br ${color} border border-opacity-30 rounded-xl p-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? formatNumber(value) : value}{suffix}
      </div>
      <div className="text-sm opacity-80">{title}</div>
      
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full"></div>
    </div>
  );

  const TrendChart: React.FC<{ data: any[]; metric: string }> = ({ data, metric }) => {
    const maxValue = Math.max(...data.map(d => d[metric]));
    
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white capitalize">{metric} Trend</h3>
          <div className="flex gap-2">
            {['downloads', 'views', 'uploads'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m as any)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize ${
                  selectedMetric === m
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative h-64">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
            {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((val, i) => (
              <div key={i}>{formatNumber(val)}</div>
            ))}
          </div>
          
          {/* Chart area */}
          <div className="ml-12 h-full flex items-end gap-1">
            {data.map((point, index) => {
              const height = (point[metric] / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t min-h-[2px] relative group cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {point[metric]} {metric}
                      <div className="text-gray-400">{point.date}</div>
                    </div>
                  </motion.div>
                  
                  {/* X-axis labels (show only some) */}
                  {index % Math.ceil(data.length / 6) === 0 && (
                    <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(point.date).getMonth() + 1}/{new Date(point.date).getDate()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Brand Asset Analytics</h2>
          <p className="text-gray-400">Performance insights and usage statistics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time range filter */}
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({...filters, timeRange: e.target.value as any})}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Downloads"
          value={filteredAnalytics.totalDownloads}
          change={12}
          icon={<Download className="w-5 h-5 text-purple-400" />}
          color="from-purple-900/20 to-indigo-900/20 border-purple-500/30"
        />
        
        <MetricCard
          title="Active Assets"
          value={filteredAnalytics.totalAssets}
          change={5}
          icon={<Activity className="w-5 h-5 text-green-400" />}
          color="from-green-900/20 to-emerald-900/20 border-green-500/30"
        />
        
        <MetricCard
          title="Compliance Rate"
          value={filteredAnalytics.complianceRate}
          change={-2}
          icon={<Target className="w-5 h-5 text-blue-400" />}
          color="from-blue-900/20 to-cyan-900/20 border-blue-500/30"
          suffix="%"
        />
        
        <MetricCard
          title="Avg. Downloads"
          value={filteredAnalytics.averageDownloads}
          change={8}
          icon={<BarChart3 className="w-5 h-5 text-orange-400" />}
          color="from-orange-900/20 to-yellow-900/20 border-orange-500/30"
        />
      </div>

      {/* Trend chart */}
      <TrendChart data={filteredAnalytics.trendData} metric={selectedMetric} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset type distribution */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Asset Distribution</h3>
          
          <div className="space-y-3">
            {Object.entries(filteredAnalytics.assetsByType)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([type, count]) => {
                const percentage = Math.round((count / filteredAnalytics.totalAssets) * 100);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="text-xl">{getAssetIcon(type as BrandAssetType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white capitalize">{type.replace('-', ' ')}</span>
                        <span className="text-gray-400 text-sm">{count} assets</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className="bg-purple-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="text-purple-400 font-medium text-sm">{percentage}%</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top performing assets */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Assets</h3>
          
          <div className="space-y-3">
            {filteredAnalytics.topAssets.slice(0, 8).map((asset, index) => (
              <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="text-gray-400 font-mono text-sm w-6">#{index + 1}</div>
                <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{getAssetIcon(asset.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{asset.name}</div>
                  <div className="text-gray-400 text-xs capitalize">{asset.type}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-medium text-white text-sm">{formatNumber(asset.totalDownloads)}</div>
                  <div className="text-gray-400 text-xs">downloads</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage contexts */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usage by Context</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { context: 'social-media', count: 234, icon: '📱' },
            { context: 'website', count: 189, icon: '🌐' },
            { context: 'email', count: 156, icon: '📧' },
            { context: 'print', count: 123, icon: '🖨️' },
            { context: 'advertising', count: 98, icon: '📢' },
            { context: 'presentation', count: 87, icon: '📊' },
            { context: 'merchandise', count: 65, icon: '🛍️' },
            { context: 'packaging', count: 43, icon: '📦' }
          ].map((item) => (
            <div key={item.context} className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-white text-lg">{formatNumber(item.count)}</div>
              <div className="text-sm text-gray-400 capitalize">{item.context.replace('-', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {[
            { action: 'Downloaded', asset: 'Company Logo - Primary', user: 'John Smith', time: '2 minutes ago', type: 'download' },
            { action: 'Uploaded', asset: 'Brand Guidelines v2.1', user: 'Sarah Wilson', time: '15 minutes ago', type: 'upload' },
            { action: 'Approved', asset: 'Social Media Template Set', user: 'Mike Johnson', time: '1 hour ago', type: 'approval' },
            { action: 'Downloaded', asset: 'Color Palette - Winter 2024', user: 'Emma Davis', time: '2 hours ago', type: 'download' },
            { action: 'Created', asset: 'Brand Guidelines v2.0', user: 'Alex Brown', time: '3 hours ago', type: 'create' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className={`p-2 rounded-full ${
                activity.type === 'download' ? 'bg-blue-900/200/20 text-blue-400' :
                activity.type === 'upload' ? 'bg-green-500/20 text-green-400' :
                activity.type === 'approval' ? 'bg-purple-500/20 text-purple-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {activity.type === 'download' ? <Download className="w-4 h-4" /> :
                 activity.type === 'upload' ? <TrendingUp className="w-4 h-4" /> :
                 activity.type === 'approval' ? <Eye className="w-4 h-4" /> :
                 <Calendar className="w-4 h-4" />}
              </div>
              
              <div className="flex-1">
                <div className="text-white text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()} 
                  <span className="font-medium text-purple-400"> {activity.asset}</span>
                </div>
                <div className="text-gray-400 text-xs">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandAssetAnalytics;