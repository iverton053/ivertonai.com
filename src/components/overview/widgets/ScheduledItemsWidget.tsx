import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Mail, MessageSquare, Megaphone, FileText, Users, ExternalLink } from 'lucide-react';
import { OverviewMetrics } from '../../../types/overview';
import { formatDate, getRelativeTime } from '../../../utils/dateHelpers';

interface ScheduledItemsWidgetProps {
  campaigns: OverviewMetrics['activeCampaigns'];
}

const ScheduledItemsWidget: React.FC<ScheduledItemsWidgetProps> = ({ campaigns }) => {
  // Combine all scheduled items and sort by time
  const allScheduledItems = [
    ...campaigns.email,
    ...campaigns.social,
    ...campaigns.content.map(item => ({
      ...item,
      type: item.type as any,
      scheduledTime: item.publishDate
    }))
  ].sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
   .slice(0, 5); // Show next 5 items

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'email':
        return Mail;
      case 'social-post':
        return MessageSquare;
      case 'ad-campaign':
        return Megaphone;
      case 'blog-post':
      case 'content':
        return FileText;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-400 bg-blue-400/10';
      case 'publishing':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'published':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'review':
        return 'text-purple-400 bg-purple-400/10';
      case 'draft':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email Campaign';
      case 'social-post':
        return 'Social Post';
      case 'ad-campaign':
        return 'Ad Campaign';
      case 'blog-post':
        return 'Blog Post';
      case 'content':
        return 'Content';
      default:
        return 'Scheduled Item';
    }
  };

  const totalScheduled = campaigns.email.length + campaigns.social.length + campaigns.content.length;

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
            <Calendar className="w-5 h-5 mr-2 text-purple-400" />
            Upcoming Schedule
          </h3>
          <p className="text-gray-400 text-sm">{totalScheduled} items scheduled</p>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors text-sm">
          View All
          <ExternalLink className="w-3 h-3 ml-1 inline" />
        </button>
      </div>

      <div className="space-y-4">
        {allScheduledItems.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No scheduled items</p>
            <p className="text-gray-500 text-xs">Create your first campaign to see it here</p>
          </div>
        ) : (
          allScheduledItems.map((item, index) => {
            const Icon = getItemIcon(item.type);
            const isNext = index === 0;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative border border-gray-700/50 rounded-lg p-4 transition-all hover:border-gray-600/50 ${
                  isNext ? 'bg-purple-500/5 border-purple-500/30' : 'bg-gray-800/30'
                }`}
              >
                {isNext && (
                  <div className="absolute -top-2 left-4">
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Next Up
                    </span>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <Icon className="w-4 h-4 text-gray-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white text-sm font-medium truncate">
                        {item.title}
                      </h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2">
                      {getTypeLabel(item.type)}
                      {item.platform && ` • ${item.platform}`}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{getRelativeTime(item.scheduledTime)}</span>
                      </div>
                      
                      {item.audience && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{item.audience.size.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional details for specific types */}
                    {item.type === 'email' && item.audience && (
                      <div className="mt-2 text-xs text-gray-500">
                        Segment: {item.audience.segment}
                      </div>
                    )}

                    {/* Show scheduled time for immediate items */}
                    {isNext && (
                      <div className="mt-2 text-xs text-purple-400">
                        Scheduled for {formatDate(item.scheduledTime, 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Quick summary */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-white">{campaigns.email.length}</div>
            <div className="text-xs text-gray-400">Email</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{campaigns.social.length}</div>
            <div className="text-xs text-gray-400">Social</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{campaigns.content.length}</div>
            <div className="text-xs text-gray-400">Content</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduledItemsWidget;