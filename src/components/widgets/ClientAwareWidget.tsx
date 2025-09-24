import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { useComprehensiveClientStore } from '../../stores/comprehensiveClientStore';
import { useAgencyStore } from '../../stores/agencyStore';

interface ClientAwareWidgetProps {
  type: 'overview' | 'performance' | 'goals' | 'recent_activity';
  className?: string;
}

const ClientAwareWidget: React.FC<ClientAwareWidgetProps> = ({ type, className = '' }) => {
  const { selectedClient } = useComprehensiveClientStore();
  const { selectedClientId, clients } = useAgencyStore();
  
  // Use comprehensive client if available, otherwise use agency client
  const currentClient = selectedClient || clients.find(client => client.id === selectedClientId);

  // Generate client-specific data based on the selected client
  const clientData = useMemo(() => {
    if (!selectedClient) return null;

    // Mock data generation based on client information
    const baseMetrics = {
      revenue: Math.floor(Math.random() * 50000) + 10000,
      leads: Math.floor(Math.random() * 200) + 50,
      traffic: Math.floor(Math.random() * 10000) + 2000,
      conversion_rate: (Math.random() * 5 + 2).toFixed(1),
    };

    // Adjust metrics based on client industry
    const industryMultipliers = {
      'Technology': { revenue: 1.5, leads: 1.2, traffic: 1.4 },
      'E-commerce': { revenue: 1.8, leads: 1.5, traffic: 2.0 },
      'Healthcare': { revenue: 1.3, leads: 0.8, traffic: 1.1 },
      'Finance': { revenue: 2.0, leads: 0.9, traffic: 1.2 },
      'Local Services': { revenue: 0.7, leads: 1.3, traffic: 0.8 },
    };

    const multiplier = industryMultipliers[selectedClient.industry as keyof typeof industryMultipliers] || 
                     { revenue: 1, leads: 1, traffic: 1 };

    return {
      ...baseMetrics,
      revenue: Math.floor(baseMetrics.revenue * multiplier.revenue),
      leads: Math.floor(baseMetrics.leads * multiplier.leads),
      traffic: Math.floor(baseMetrics.traffic * multiplier.traffic),
    };
  }, [selectedClient]);

  if (!selectedClient || !clientData) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-lg border border-gray-600/50 rounded-2xl p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a client to view data</p>
        </div>
      </div>
    );
  }

  const renderOverviewWidget = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{selectedClient.name}</h3>
            <p className="text-gray-400 text-sm">{selectedClient.industry} • {selectedClient.status}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">Last updated</p>
          <p className="text-white text-sm">Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <span className="text-green-400 text-xs font-medium">+12.5%</span>
          </div>
          <div className="text-2xl font-bold text-white">${clientData.revenue.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Monthly Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-green-400" />
            <span className="text-green-400 text-xs font-medium">+8.2%</span>
          </div>
          <div className="text-2xl font-bold text-white">{clientData.leads}</div>
          <div className="text-gray-400 text-sm">New Leads</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <span className="text-green-400 text-xs font-medium">+15.1%</span>
          </div>
          <div className="text-2xl font-bold text-white">{clientData.traffic.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Website Traffic</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-purple-400" />
            <span className="text-green-400 text-xs font-medium">+2.3%</span>
          </div>
          <div className="text-2xl font-bold text-white">{clientData.conversion_rate}%</div>
          <div className="text-gray-400 text-sm">Conversion Rate</div>
        </div>
      </div>

      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="w-5 h-5 text-yellow-400" />
          <h4 className="font-semibold text-white">Active Goals</h4>
        </div>
        <div className="space-y-2">
          {selectedClient.business?.goals.slice(0, 3).map((goal, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{goal}</span>
              <span className="text-yellow-400 text-xs">In Progress</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceWidget = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          <p className="text-gray-400 text-sm">Real-time data for {selectedClient.name}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div>
            <p className="text-white font-medium">Revenue Growth</p>
            <p className="text-gray-400 text-sm">vs last month</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold">+12.5%</p>
            <p className="text-gray-400 text-xs">$15,500</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div>
            <p className="text-white font-medium">Lead Quality</p>
            <p className="text-gray-400 text-sm">qualified leads</p>
          </div>
          <div className="text-right">
            <p className="text-blue-400 font-bold">87%</p>
            <p className="text-gray-400 text-xs">+5% improvement</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
          <div>
            <p className="text-white font-medium">Client Satisfaction</p>
            <p className="text-gray-400 text-sm">based on feedback</p>
          </div>
          <div className="text-right">
            <p className="text-purple-400 font-bold">4.8/5</p>
            <p className="text-gray-400 text-xs">excellent</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-green-400" />
          <p className="text-green-400 font-medium text-sm">Next Milestone</p>
        </div>
        <p className="text-white text-sm">Q4 revenue target: ${(clientData.revenue * 1.2).toLocaleString()}</p>
        <p className="text-gray-400 text-xs mt-1">On track to achieve by Dec 31</p>
      </div>
    </div>
  );

  const renderGoalsWidget = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="w-6 h-6 text-yellow-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Business Goals</h3>
          <p className="text-gray-400 text-sm">{selectedClient.business?.goals.length || 0} active goals</p>
        </div>
      </div>

      <div className="space-y-3">
        {selectedClient.business?.goals.map((goal, index) => {
          const progress = Math.floor(Math.random() * 80) + 20; // Mock progress
          const isCompleted = progress >= 100;
          
          return (
            <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">{goal}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isCompleted ? 'bg-green-600/20 text-green-400' :
                  progress > 60 ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-blue-600/20 text-blue-400'
                }`}>
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-2 rounded-full ${
                    isCompleted ? 'bg-green-400' :
                    progress > 60 ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Target completion: {new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRecentActivityWidget = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="text-gray-400 text-sm">Latest updates for {selectedClient.name}</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          {
            action: 'Campaign launched',
            details: `New ${selectedClient.business?.services[0] || 'SEO'} campaign started`,
            time: '2 hours ago',
            type: 'launch'
          },
          {
            action: 'Goal milestone reached',
            details: `${selectedClient.business?.goals[0] || 'Website traffic'} target 75% complete`,
            time: '1 day ago',
            type: 'milestone'
          },
          {
            action: 'Report generated',
            details: 'Monthly performance report sent to client',
            time: '3 days ago',
            type: 'report'
          },
          {
            action: 'Integration updated',
            details: 'Google Analytics connection refreshed',
            time: '1 week ago',
            type: 'integration'
          }
        ].map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.type === 'launch' ? 'bg-green-400' :
              activity.type === 'milestone' ? 'bg-yellow-400' :
              activity.type === 'report' ? 'bg-blue-400' :
              'bg-purple-400'
            }`} />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{activity.action}</p>
              <p className="text-gray-400 text-xs">{activity.details}</p>
              <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getWidgetTitle = () => {
    switch (type) {
      case 'overview': return 'Client Overview';
      case 'performance': return 'Performance Metrics';
      case 'goals': return 'Business Goals';
      case 'recent_activity': return 'Recent Activity';
      default: return 'Client Data';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-800/50 backdrop-blur-lg border border-gray-600/50 rounded-2xl p-6 ${className}`}
    >
      {type === 'overview' && renderOverviewWidget()}
      {type === 'performance' && renderPerformanceWidget()}
      {type === 'goals' && renderGoalsWidget()}
      {type === 'recent_activity' && renderRecentActivityWidget()}
    </motion.div>
  );
};

export default ClientAwareWidget;