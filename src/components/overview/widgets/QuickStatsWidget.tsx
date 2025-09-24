import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Zap, Users, TrendingUp, Calendar, Target, Activity } from 'lucide-react';
import { EmailStats, SocialStats, AutomationStats, CRMStats } from '../../../types/overview';

interface QuickStatsWidgetProps {
  stats: {
    emailMarketing: EmailStats;
    socialMedia: SocialStats;
    automation: AutomationStats;
    crm: CRMStats;
  };
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ stats }) => {
  const statSections = [
    {
      title: 'Email Marketing',
      icon: Mail,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      stats: [
        { label: 'Open Rate', value: `${stats.emailMarketing.averageOpenRate}%` },
        { label: 'Active Campaigns', value: stats.emailMarketing.activeCampaigns },
        { label: 'Subscribers', value: stats.emailMarketing.totalSubscribers.toLocaleString() },
        { label: 'Recent Opens', value: stats.emailMarketing.recentPerformance.opened.toLocaleString() }
      ]
    },
    {
      title: 'Social Media',
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      stats: [
        { label: 'Total Followers', value: stats.socialMedia.totalFollowers.toLocaleString() },
        { label: 'Scheduled Posts', value: stats.socialMedia.scheduledPosts },
        { label: 'Engagement', value: stats.socialMedia.totalEngagement.toLocaleString() },
        { label: 'Recent Reach', value: stats.socialMedia.recentPerformance.reach.toLocaleString() }
      ]
    },
    {
      title: 'Automation',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      stats: [
        { label: 'Success Rate', value: `${stats.automation.averageSuccessRate}%` },
        { label: 'Active Workflows', value: stats.automation.activeAutomations },
        { label: 'Completed Today', value: stats.automation.completedToday },
        { label: 'Time Saved', value: `${stats.automation.timeSavedHours}h` }
      ]
    },
    {
      title: 'CRM',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      stats: [
        { label: 'Conversion Rate', value: `${stats.crm.conversionRate}%` },
        { label: 'Pipeline Value', value: `$${(stats.crm.dealsValue / 1000).toFixed(0)}k` },
        { label: 'New Leads Today', value: stats.crm.newContactsToday },
        { label: 'Active Deals', value: stats.crm.dealsInPipeline }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-effect rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-400" />
            Quick Stats
          </h3>
          <p className="text-gray-400 text-sm">Performance snapshot across all features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          >
            {/* Section Header */}
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg ${section.bgColor}`}>
                <section.icon className={`w-4 h-4 ${section.color}`} />
              </div>
              <h4 className="text-white text-sm font-medium ml-2">{section.title}</h4>
            </div>

            {/* Stats Grid */}
            <div className="space-y-3">
              {section.stats.map((stat, statIndex) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: (sectionIndex * 0.1) + (statIndex * 0.05) }}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-400 text-xs">{stat.label}</span>
                  <span className="text-white text-sm font-semibold">{stat.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Mini trend indicator */}
            <div className="mt-4 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {section.title === 'Email Marketing' && stats.emailMarketing.recentPerformance.timeframe}
                  {section.title === 'Social Media' && stats.socialMedia.recentPerformance.timeframe}
                  {section.title === 'Automation' && stats.automation.recentRuns.timeframe}
                  {section.title === 'CRM' && stats.crm.recentActivity.timeframe}
                </span>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+5.2%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Platform breakdown for Social Media */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <h4 className="text-sm font-medium text-white mb-3">Social Media Platform Breakdown</h4>
        <div className="grid grid-cols-3 gap-4">
          {stats.socialMedia.platformBreakdown.map((platform, index) => (
            <motion.div
              key={platform.platform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
              className="text-center p-3 bg-gray-800/30 rounded-lg"
            >
              <div className="text-sm font-semibold text-white">
                {platform.followers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mb-1">{platform.platform}</div>
              <div className="text-xs text-purple-400">
                {platform.engagement} interactions
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default QuickStatsWidget;