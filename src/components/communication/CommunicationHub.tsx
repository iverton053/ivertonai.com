import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  Clock,
  Users,
  Search,
  Settings,
  Smartphone
} from 'lucide-react';
import { EnhancedBadge, StatusIndicator } from '../ui/EnhancedVisualHierarchy';
import InPlatformMessaging from './InPlatformMessaging';
import MeetingScheduler from './MeetingScheduler';
import AutomatedCheckIns from './AutomatedCheckIns';
import SecurityCompliance from './SecurityCompliance';
import MobileAccessibility from './MobileAccessibility';
import { useOverviewStore } from '../../stores';

interface CommunicationHubProps {
  clientData?: any;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({ clientData }) => {
  const [activeTab, setActiveTab] = useState<'messaging' | 'meetings' | 'checkins' | 'security' | 'mobile'>('messaging');
  const [unreadMessages, setUnreadMessages] = useState(7);
  const [upcomingMeetings, setUpcomingMeetings] = useState(3);
  const [pendingCheckins, setPendingCheckins] = useState(2);
  
  // Overview store integration
  const updateCommunication = useOverviewStore(state => state.updateCommunication);
  
  // Update overview store when communication metrics change
  useEffect(() => {
    updateCommunication({
      unreadMessages,
      upcomingMeetings,
      activeCheckIns: pendingCheckins,
      totalConversations: 24, // Mock data for now
      completedMeetings: 8, // Mock data for now
      checkInResponseRate: 84.2, // Mock data for now
    });
  }, [unreadMessages, upcomingMeetings, pendingCheckins, updateCommunication]);

  const tabs = [
    {
      id: 'messaging' as const,
      label: 'Messages',
      icon: MessageCircle,
      count: unreadMessages,
      color: 'blue'
    },
    {
      id: 'meetings' as const,
      label: 'Meetings',
      icon: Calendar,
      count: upcomingMeetings,
      color: 'purple'
    },
    {
      id: 'checkins' as const,
      label: 'Check-ins',
      icon: Clock,
      count: pendingCheckins,
      color: 'green'
    },
    {
      id: 'security' as const,
      label: 'Security',
      icon: Settings,
      count: 0,
      color: 'red'
    },
    {
      id: 'mobile' as const,
      label: 'Mobile/A11y',
      icon: Smartphone,
      count: 0,
      color: 'orange'
    }
  ];


  const renderTabContent = () => {
    console.log('Current active tab:', activeTab); // Debug log
    
    try {
      switch (activeTab) {
        case 'messaging':
          return <InPlatformMessaging onUnreadChange={setUnreadMessages} />;
        case 'meetings':
          return <MeetingScheduler onMeetingChange={setUpcomingMeetings} />;
        case 'checkins':
          return <AutomatedCheckIns onCheckinChange={setPendingCheckins} />;
        case 'security':
          return <SecurityCompliance />;
        case 'mobile':
          return <MobileAccessibility />;
        default:
          return (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Communication Hub</h3>
              <p className="text-gray-400 text-sm">Current tab: {activeTab}</p>
              <p className="text-gray-400 text-sm">Select a tab to get started</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">Error Loading Content</h3>
          <p className="text-red-400 text-sm">Failed to load {activeTab} content</p>
        </div>
      );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Communication Hub</h1>
          <p className="text-gray-400">Manage team communication, client meetings, and automated touchpoints</p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIndicator status="active" label="Online" />
          <EnhancedBadge variant="success" animate glow>
            Connected
          </EnhancedBadge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('messaging')}
          className="glass-effect rounded-xl p-6 border border-white/10 cursor-pointer hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="blue" size="sm">{unreadMessages}</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">24</h3>
          <p className="text-gray-400 text-sm">Active Conversations</p>
          <div className="mt-2 text-xs text-blue-400 opacity-75">Click to view messages</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('meetings')}
          className="glass-effect rounded-xl p-6 border border-white/10 cursor-pointer hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="purple" size="sm">{upcomingMeetings}</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">12</h3>
          <p className="text-gray-400 text-sm">Meetings This Week</p>
          <div className="mt-2 text-xs text-purple-400 opacity-75">Click to manage meetings</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('checkins')}
          className="glass-effect rounded-xl p-6 border border-white/10 cursor-pointer hover:border-green-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
              <Clock className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="green" size="sm">{pendingCheckins}</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">8</h3>
          <p className="text-gray-400 text-sm">Automated Check-ins</p>
          <div className="mt-2 text-xs text-green-400 opacity-75">Click to view check-ins</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('security')}
          className="glass-effect rounded-xl p-6 border border-white/10 cursor-pointer hover:border-red-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400">
              <Settings className="w-6 h-6" />
            </div>
            <StatusIndicator status="active" showIcon={false} size="sm" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">99%</h3>
          <p className="text-gray-400 text-sm">Security Score</p>
          <div className="mt-2 text-xs text-red-400 opacity-75">Click to view security</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('mobile')}
          className="glass-effect rounded-xl p-6 border border-white/10 cursor-pointer hover:border-orange-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="orange" size="sm">AA</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">100%</h3>
          <p className="text-gray-400 text-sm">Accessibility</p>
          <div className="mt-2 text-xs text-orange-400 opacity-75">Click to optimize mobile</div>
        </motion.div>
      </div>

      <div className="w-full">
        {/* Main Content Area */}
        <div className="w-full">
          {/* Tab Navigation */}
          <div className="glass-effect rounded-xl border border-white/10 mb-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const searchInput = document.querySelector('input[placeholder="Search conversations..."]') as HTMLInputElement;
                    if (searchInput) {
                      setActiveTab('messaging');
                      setTimeout(() => {
                        searchInput.focus();
                      }, 100);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const settings = [
                      'Notification preferences',
                      'Auto-reply settings',
                      'Meeting default duration',
                      'Check-in frequency',
                      'Integration settings',
                      'Export data',
                      'Privacy settings',
                      'Accessibility settings'
                    ];
                    const choice = prompt(`Communication Hub Settings:\n${settings.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nEnter number (1-${settings.length}):`);
                    if (choice && parseInt(choice) > 0 && parseInt(choice) <= settings.length) {
                      if (parseInt(choice) === settings.length) {
                        setActiveTab('mobile');
                      } else {
                        alert(`${settings[parseInt(choice) - 1]} would open here with full configuration options.`);
                      }
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 bg-gray-800/20 rounded-b-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;