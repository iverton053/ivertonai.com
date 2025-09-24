import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Target, Users, Zap, FileText, BarChart3, ExternalLink } from 'lucide-react';
import { ActivityItem } from '../../../types/overview';
import { getRelativeTime } from '../../../utils/dateHelpers';

interface RecentActivityWidgetProps {
  activities: ActivityItem[];
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'campaign-launched': return Mail;
      case 'goal-achieved': return Target;
      case 'lead-converted': return Users;
      case 'automation-completed': return Zap;
      case 'content-published': return FileText;
      case 'alert-triggered': return BarChart3;
      default: return Activity;
    }
  };

  const getSourceColor = (source: ActivityItem['source']) => {
    switch (source) {
      case 'email-marketing': return 'bg-blue-400/10 text-blue-400';
      case 'social-media': return 'bg-purple-400/10 text-purple-400';
      case 'crm': return 'bg-green-400/10 text-green-400';
      case 'automation': return 'bg-yellow-400/10 text-yellow-400';
      case 'content': return 'bg-indigo-400/10 text-indigo-400';
      case 'analytics': return 'bg-orange-400/10 text-orange-400';
      default: return 'bg-gray-400/10 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-effect rounded-xl p-6 h-fit"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Recent Activity
          </h3>
          <p className="text-gray-400 text-sm">Latest updates across your business</p>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors text-sm">
          View All
          <ExternalLink className="w-3 h-3 ml-1 inline" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No recent activity</p>
            <p className="text-gray-500 text-xs">Activity will appear here as it happens</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 border border-gray-700/50 rounded-lg hover:border-gray-600/50 transition-colors"
              >
                <div className="p-2 bg-gray-700/50 rounded-lg">
                  <Icon className="w-4 h-4 text-gray-300" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white text-sm font-medium truncate">
                      {activity.title}
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(activity.source)}`}>
                      {activity.source.replace('-', ' ')}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    {getRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {activities.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            View {activities.length - 5} more activities
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivityWidget;