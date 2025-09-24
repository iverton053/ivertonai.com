import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, Eye, Download, Clock,
  MousePointer, Mail, Globe, FileText, Video, Calendar,
  Zap, Target, AlertTriangle, CheckCircle, RefreshCw,
  BarChart3, Filter, Search, Settings, Play, Pause,
  ExternalLink, User, ArrowUp, ArrowDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface BehavioralActivity {
  id: string;
  contactId: string;
  type: 'page_view' | 'download' | 'email_open' | 'email_click' | 'form_submit' | 'video_watch' | 'doc_view';
  action: string;
  timestamp: string;
  metadata: {
    page?: string;
    duration?: number;
    source?: string;
    campaign?: string;
    device?: string;
    location?: string;
  };
  scoreImpact: number;
  isRealTime?: boolean;
}

interface BehavioralScore {
  contactId: string;
  totalScore: number;
  components: {
    engagement: {
      score: number;
      activities: number;
      trend: 'up' | 'down' | 'stable';
    };
    intent: {
      score: number;
      signals: number;
      trend: 'up' | 'down' | 'stable';
    };
    recency: {
      score: number;
      lastActivity: string;
      trend: 'up' | 'down' | 'stable';
    };
    frequency: {
      score: number;
      activeDays: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  triggers: Array<{
    id: string;
    name: string;
    threshold: number;
    currentValue: number;
    triggered: boolean;
    action: string;
  }>;
  history: Array<{
    timestamp: string;
    score: number;
    change: number;
    reason: string;
  }>;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  behavioralScore: BehavioralScore;
  recentActivities: BehavioralActivity[];
}

const BehavioralScoring: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [realtimeActivities, setRealtimeActivities] = useState<BehavioralActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'activity' | 'trend'>('score');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        company: 'TechCorp Solutions',
        behavioralScore: {
          contactId: '1',
          totalScore: 87,
          components: {
            engagement: { score: 92, activities: 45, trend: 'up' },
            intent: { score: 85, signals: 12, trend: 'up' },
            recency: { score: 95, lastActivity: '2024-01-21T14:30:00Z', trend: 'stable' },
            frequency: { score: 76, activeDays: 8, trend: 'up' }
          },
          triggers: [
            { id: 't1', name: 'High Intent Signal', threshold: 80, currentValue: 85, triggered: true, action: 'Notify Sales Rep' },
            { id: 't2', name: 'Pricing Page Views', threshold: 3, currentValue: 5, triggered: true, action: 'Send Pricing Email' },
            { id: 't3', name: 'Demo Request Ready', threshold: 90, currentValue: 87, triggered: false, action: 'Schedule Demo Call' }
          ],
          history: [
            { timestamp: '2024-01-21T14:30:00Z', score: 87, change: +5, reason: 'Viewed pricing page (5 min)' },
            { timestamp: '2024-01-21T13:15:00Z', score: 82, change: +3, reason: 'Downloaded whitepaper' },
            { timestamp: '2024-01-21T11:45:00Z', score: 79, change: +2, reason: 'Opened follow-up email' },
            { timestamp: '2024-01-20T16:20:00Z', score: 77, change: +8, reason: 'Watched product demo video' }
          ]
        },
        recentActivities: [
          {
            id: 'a1',
            contactId: '1',
            type: 'page_view',
            action: 'Viewed Pricing Page',
            timestamp: '2024-01-21T14:30:00Z',
            metadata: { page: '/pricing', duration: 300, source: 'email', campaign: 'nurture-seq-1' },
            scoreImpact: +5,
            isRealTime: true
          },
          {
            id: 'a2',
            contactId: '1',
            type: 'download',
            action: 'Downloaded ROI Calculator',
            timestamp: '2024-01-21T13:15:00Z',
            metadata: { source: 'website', device: 'desktop' },
            scoreImpact: +3
          }
        ]
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@startup.io',
        company: 'Startup Labs',
        behavioralScore: {
          contactId: '2',
          totalScore: 64,
          components: {
            engagement: { score: 58, activities: 23, trend: 'down' },
            intent: { score: 72, signals: 8, trend: 'stable' },
            recency: { score: 45, lastActivity: '2024-01-19T10:15:00Z', trend: 'down' },
            frequency: { score: 81, activeDays: 12, trend: 'up' }
          },
          triggers: [
            { id: 't4', name: 'Re-engagement Needed', threshold: 50, currentValue: 45, triggered: true, action: 'Send Re-engagement Email' },
            { id: 't5', name: 'Feature Interest', threshold: 70, currentValue: 72, triggered: true, action: 'Send Feature Demo' }
          ],
          history: [
            { timestamp: '2024-01-19T10:15:00Z', score: 64, change: -3, reason: 'No activity for 2 days' },
            { timestamp: '2024-01-17T15:30:00Z', score: 67, change: +4, reason: 'Clicked feature comparison link' }
          ]
        },
        recentActivities: [
          {
            id: 'a3',
            contactId: '2',
            type: 'email_click',
            action: 'Clicked Feature Comparison',
            timestamp: '2024-01-17T15:30:00Z',
            metadata: { campaign: 'product-features', source: 'email' },
            scoreImpact: +4
          }
        ]
      }
    ];

    setContacts(mockContacts);
    setLoading(false);
  }, []);

  // Simulate real-time activity updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      const activities = [
        'Viewed product demo',
        'Downloaded case study',
        'Visited pricing page',
        'Opened newsletter',
        'Clicked CTA button',
        'Watched tutorial video',
        'Filled contact form',
        'Downloaded trial'
      ];

      const activityTypes: BehavioralActivity['type'][] = [
        'page_view', 'download', 'email_open', 'email_click', 'form_submit', 'video_watch'
      ];

      if (Math.random() > 0.7) { // 30% chance of new activity
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const activity: BehavioralActivity = {
          id: `rt_${Date.now()}`,
          contactId: contact.id,
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          action: activities[Math.floor(Math.random() * activities.length)],
          timestamp: new Date().toISOString(),
          metadata: {
            source: Math.random() > 0.5 ? 'website' : 'email',
            duration: Math.floor(Math.random() * 300) + 30
          },
          scoreImpact: Math.floor(Math.random() * 8) + 1,
          isRealTime: true
        };

        setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);

        // Update contact's behavioral score
        setContacts(prev => prev.map(c => 
          c.id === contact.id 
            ? {
                ...c,
                behavioralScore: {
                  ...c.behavioralScore,
                  totalScore: Math.min(100, c.behavioralScore.totalScore + activity.scoreImpact),
                  history: [
                    {
                      timestamp: activity.timestamp,
                      score: Math.min(100, c.behavioralScore.totalScore + activity.scoreImpact),
                      change: activity.scoreImpact,
                      reason: activity.action
                    },
                    ...c.behavioralScore.history.slice(0, 9)
                  ]
                },
                recentActivities: [activity, ...c.recentActivities.slice(0, 4)]
              }
            : c
        ));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMode, contacts]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'email_open': return <Mail className="w-4 h-4" />;
      case 'email_click': return <MousePointer className="w-4 h-4" />;
      case 'form_submit': return <FileText className="w-4 h-4" />;
      case 'video_watch': return <Video className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const filteredContacts = contacts
    .filter(contact => 
      searchQuery === '' ||
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.behavioralScore.totalScore - a.behavioralScore.totalScore;
        case 'activity':
          return new Date(b.recentActivities[0]?.timestamp || 0).getTime() - 
                 new Date(a.recentActivities[0]?.timestamp || 0).getTime();
        case 'trend':
          return b.behavioralScore.history[0]?.change || 0 - a.behavioralScore.history[0]?.change || 0;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Behavioral Scoring</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time lead scoring based on website and email behavior
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isLiveMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isLiveMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isLiveMode ? 'Live Mode' : 'Paused'}
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Configure Triggers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Real-time Activity Feed */}
        <div className="glass-effect rounded-xl p-6 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Live Activity Feed</h3>
            {isLiveMode && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400">Live</span>
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realtimeActivities.map(activity => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">
                    {activity.action}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {contacts.find(c => c.id === activity.contactId)?.firstName} {contacts.find(c => c.id === activity.contactId)?.lastName}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      +{activity.scoreImpact}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            >
              <option value="score">Sort by Score</option>
              <option value="activity">Sort by Activity</option>
              <option value="trend">Sort by Trend</option>
            </select>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContacts.map(contact => (
              <motion.div
                key={contact.id}
                className="glass-effect rounded-xl p-6 border border-gray-600 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedContact(contact)}
              >
                {/* Contact Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.company}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 text-sm font-medium rounded-full ${getScoreColor(contact.behavioralScore.totalScore)}`}>
                    {contact.behavioralScore.totalScore}
                  </div>
                </div>

                {/* Score Components */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(contact.behavioralScore.components).map(([key, component]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-300 capitalize">
                          {key}
                        </span>
                        {getTrendIcon(component.trend)}
                      </div>
                      <span className="text-sm font-bold text-white">
                        {component.score}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">Recent Activity</div>
                  {contact.recentActivities.slice(0, 2).map(activity => (
                    <div key={activity.id} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      {getActivityIcon(activity.type)}
                      <span className="flex-1 truncate">{activity.action}</span>
                      <span className="font-medium text-green-600">+{activity.scoreImpact}</span>
                    </div>
                  ))}
                </div>

                {/* Triggered Actions */}
                {contact.behavioralScore.triggers.some(t => t.triggered) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        {contact.behavioralScore.triggers.filter(t => t.triggered).length} trigger(s) active
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContact(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedContact.firstName} {selectedContact.lastName} - Behavioral Analysis
                </h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score History Chart */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-4">Score History</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedContact.behavioralScore.history.slice().reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Triggers & Actions */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-4">Active Triggers</h4>
                  <div className="space-y-3">
                    {selectedContact.behavioralScore.triggers.map(trigger => (
                      <div
                        key={trigger.id}
                        className={`p-3 rounded border ${
                          trigger.triggered 
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
                            : 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{trigger.name}</span>
                          {trigger.triggered ? (
                            <CheckCircle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Threshold: {trigger.threshold} | Current: {trigger.currentValue}
                        </div>
                        <div className="text-sm font-medium text-white">
                          Action: {trigger.action}
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${trigger.triggered ? 'bg-orange-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, (trigger.currentValue / trigger.threshold) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-4">Activity Timeline</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedContact.behavioralScore.history.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-600 rounded">
                        <div className="flex-shrink-0">
                          {item.change > 0 ? (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{item.reason}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.change > 0 ? '+' : ''}{item.change}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
                          <span className="text-sm font-bold text-white">{item.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Update Triggers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BehavioralScoring;