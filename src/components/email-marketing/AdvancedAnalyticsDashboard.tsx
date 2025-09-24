import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, Eye, MousePointer, Users, Mail,
  Calendar, Filter, Download, RefreshCw, Settings, ChevronDown,
  Target, Clock, DollarSign, Percent, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

interface AnalyticsData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  revenue: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  type: string;
  sent: number;
  openRate: number;
  clickRate: number;
  revenue: number;
  roas: number;
}

interface SegmentAnalytics {
  segment: string;
  subscribers: number;
  avgOpenRate: number;
  avgClickRate: number;
  revenue: number;
  ltv: number;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analyticsData] = useState<AnalyticsData[]>([
    { date: '2024-09-01', sent: 12500, delivered: 12125, opened: 3875, clicked: 465, bounced: 375, unsubscribed: 25, revenue: 2850 },
    { date: '2024-09-02', sent: 8750, delivered: 8531, opened: 2872, clicked: 387, bounced: 219, unsubscribed: 15, revenue: 1950 },
    { date: '2024-09-03', sent: 15200, delivered: 14896, opened: 4765, clicked: 572, bounced: 304, unsubscribed: 32, revenue: 3420 },
    { date: '2024-09-04', sent: 9800, delivered: 9604, opened: 3265, clicked: 423, bounced: 196, unsubscribed: 18, revenue: 2680 },
    { date: '2024-09-05', sent: 11300, delivered: 11073, opened: 3987, clicked: 518, bounced: 227, unsubscribed: 22, revenue: 3150 },
    { date: '2024-09-06', sent: 13750, delivered: 13475, opened: 4562, clicked: 639, bounced: 275, unsubscribed: 28, revenue: 3875 },
    { date: '2024-09-07', sent: 10950, delivered: 10731, opened: 3654, clicked: 486, bounced: 219, unsubscribed: 19, revenue: 2940 }
  ]);

  const [campaignPerformance] = useState<CampaignPerformance[]>([
    { id: '1', name: 'Summer Sale 2024', type: 'Promotional', sent: 25000, openRate: 28.5, clickRate: 4.2, revenue: 15250, roas: 4.8 },
    { id: '2', name: 'Weekly Newsletter #42', type: 'Newsletter', sent: 18500, openRate: 35.2, clickRate: 6.1, revenue: 3200, roas: 2.1 },
    { id: '3', name: 'Product Launch Alert', type: 'Announcement', sent: 12750, openRate: 42.1, clickRate: 8.3, revenue: 8900, roas: 6.2 },
    { id: '4', name: 'Cart Abandonment', type: 'Automation', sent: 8200, openRate: 31.8, clickRate: 12.4, revenue: 4650, roas: 8.9 },
    { id: '5', name: 'Welcome Series', type: 'Automation', sent: 5500, openRate: 45.6, clickRate: 15.2, revenue: 2850, roas: 5.7 }
  ]);

  const [segmentAnalytics] = useState<SegmentAnalytics[]>([
    { segment: 'VIP Customers', subscribers: 1250, avgOpenRate: 52.3, avgClickRate: 18.7, revenue: 125000, ltv: 485 },
    { segment: 'Regular Buyers', subscribers: 8500, avgOpenRate: 38.9, avgClickRate: 8.4, revenue: 85000, ltv: 125 },
    { segment: 'New Subscribers', subscribers: 15200, avgOpenRate: 28.1, avgClickRate: 4.2, revenue: 18500, ltv: 45 },
    { segment: 'Inactive Users', subscribers: 5800, avgOpenRate: 12.5, avgClickRate: 1.8, revenue: 2100, ltv: 15 },
    { segment: 'Prospects', subscribers: 22000, avgOpenRate: 22.7, avgClickRate: 3.1, revenue: 12500, ltv: 28 }
  ]);

  const [selectedMetric, setSelectedMetric] = useState<'opens' | 'clicks' | 'revenue' | 'deliverability'>('opens');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'area'>('line');
  const [isLoading, setIsLoading] = useState(false);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const metrics = [
    {
      key: 'opens',
      label: 'Opens',
      icon: Eye,
      value: analyticsData.reduce((sum, d) => sum + d.opened, 0).toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const
    },
    {
      key: 'clicks',
      label: 'Clicks',
      icon: MousePointer,
      value: analyticsData.reduce((sum, d) => sum + d.clicked, 0).toLocaleString(),
      change: '+8.3%',
      trend: 'up' as const
    },
    {
      key: 'revenue',
      label: 'Revenue',
      icon: DollarSign,
      value: `$${analyticsData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}`,
      change: '+15.7%',
      trend: 'up' as const
    },
    {
      key: 'deliverability',
      label: 'Deliverability',
      icon: Target,
      value: `${((analyticsData.reduce((sum, d) => sum + d.delivered, 0) / analyticsData.reduce((sum, d) => sum + d.sent, 0)) * 100).toFixed(1)}%`,
      change: '-0.8%',
      trend: 'down' as const
    }
  ];

  const handleRefreshData = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      analytics: analyticsData,
      campaigns: campaignPerformance,
      segments: segmentAnalytics,
      summary: {
        totalSent: analyticsData.reduce((sum, d) => sum + d.sent, 0),
        totalOpened: analyticsData.reduce((sum, d) => sum + d.opened, 0),
        totalClicked: analyticsData.reduce((sum, d) => sum + d.clicked, 0),
        totalRevenue: analyticsData.reduce((sum, d) => sum + d.revenue, 0)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    const data = analyticsData.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      openRate: (d.opened / d.delivered) * 100,
      clickRate: (d.clicked / d.delivered) * 100,
      bounceRate: (d.bounced / d.sent) * 100
    }));

    const commonProps = {
      width: '100%',
      height: 300,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (selectedChart === 'area') {
      return (
        <ResponsiveContainer {...commonProps}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric === 'opens' ? 'opened' : selectedMetric === 'clicks' ? 'clicked' : selectedMetric === 'revenue' ? 'revenue' : 'delivered'}
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (selectedChart === 'bar') {
      return (
        <ResponsiveContainer {...commonProps}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Bar
              dataKey={selectedMetric === 'opens' ? 'opened' : selectedMetric === 'clicks' ? 'clicked' : selectedMetric === 'revenue' ? 'revenue' : 'delivered'}
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer {...commonProps}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          <Line
            type="monotone"
            dataKey={selectedMetric === 'opens' ? 'opened' : selectedMetric === 'clicks' ? 'clicked' : selectedMetric === 'revenue' ? 'revenue' : 'delivered'}
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-gray-400 mt-2">Comprehensive email marketing performance insights</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['7d', '30d', '90d', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefreshData}
            disabled={isLoading}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
              selectedMetric === metric.key ? 'ring-2 ring-blue-500 bg-gray-750' : 'hover:bg-gray-750'
            }`}
            onClick={() => setSelectedMetric(metric.key as any)}
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="w-8 h-8 text-blue-400" />
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-gray-400">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-700 rounded-lg p-1">
                {[
                  { key: 'line', icon: TrendingUp },
                  { key: 'bar', icon: BarChart3 },
                  { key: 'area', icon: BarChart3 }
                ].map((chart) => (
                  <button
                    key={chart.key}
                    onClick={() => setSelectedChart(chart.key as any)}
                    className={`p-2 rounded-md transition-colors ${
                      selectedChart === chart.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    <chart.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {renderChart()}
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Segment Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentAnalytics}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="revenue"
                nameKey="segment"
              >
                {segmentAnalytics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {segmentAnalytics.map((segment, index) => (
              <div key={segment.segment} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-gray-300">{segment.segment}</span>
                </div>
                <span className="text-white font-medium">${segment.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1">
            <span>View All</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-400">Campaign</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Type</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Sent</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Open Rate</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Click Rate</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Revenue</th>
                <th className="pb-3 text-sm font-medium text-gray-400">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {campaignPerformance.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-750 transition-colors">
                  <td className="py-4 text-white font-medium">{campaign.name}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.type === 'Promotional' ? 'bg-green-900 text-green-300' :
                      campaign.type === 'Newsletter' ? 'bg-blue-900 text-blue-300' :
                      campaign.type === 'Automation' ? 'bg-purple-900 text-purple-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {campaign.type}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{campaign.sent.toLocaleString()}</td>
                  <td className="py-4 text-gray-300">{campaign.openRate}%</td>
                  <td className="py-4 text-gray-300">{campaign.clickRate}%</td>
                  <td className="py-4 text-white font-medium">${campaign.revenue.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`font-medium ${
                      campaign.roas >= 5 ? 'text-green-400' :
                      campaign.roas >= 3 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {campaign.roas}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;