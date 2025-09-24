import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Clock,
  Calendar,
  Repeat,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  Hash,
  AtSign,
  Globe,
  AlertCircle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  Edit3,
  Trash2,
  Plus,
  Filter,
  Search,
  ArrowRight,
  Bot,
  Sparkles
} from 'lucide-react';
import { SocialPlatform } from '../../types/socialMedia';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'schedule' | 'engagement' | 'hashtag' | 'mention' | 'keyword';
    conditions: any;
  };
  actions: {
    type: 'post' | 'repost' | 'reply' | 'dm' | 'follow' | 'like' | 'comment';
    settings: any;
  }[];
  platforms: SocialPlatform[];
  isActive: boolean;
  runsCount: number;
  lastRun?: string;
  nextRun?: string;
  successRate: number;
  createdAt: string;
}

const AutomationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'templates' | 'analytics'>('rules');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  // Mock automation rules
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Daily Motivation Posts',
      description: 'Post motivational quotes every weekday at 9 AM',
      trigger: {
        type: 'schedule',
        conditions: { time: '09:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
      },
      actions: [
        {
          type: 'post',
          settings: {
            content: 'template',
            templateId: 'motivation-quotes',
            addHashtags: ['#MondayMotivation', '#Success', '#Productivity']
          }
        }
      ],
      platforms: ['linkedin', 'facebook'],
      isActive: true,
      runsCount: 156,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      successRate: 98.2,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Auto-Engagement Booster',
      description: 'Like and comment on posts with high engagement in your industry',
      trigger: {
        type: 'engagement',
        conditions: { threshold: 100, hashtags: ['#AI', '#automation', '#tech'] }
      },
      actions: [
        {
          type: 'like',
          settings: { delay: '2-5min' }
        },
        {
          type: 'comment',
          settings: {
            templates: [
              'Great insights! 👏',
              'Thanks for sharing this!',
              'Very informative post 💡'
            ]
          }
        }
      ],
      platforms: ['linkedin', 'instagram'],
      isActive: true,
      runsCount: 89,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      successRate: 94.7,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Weekend Content Recycler',
      description: 'Repost top-performing content from the past month on weekends',
      trigger: {
        type: 'schedule',
        conditions: { time: '14:00', days: ['saturday', 'sunday'] }
      },
      actions: [
        {
          type: 'repost',
          settings: {
            criteria: 'top-engagement',
            timeframe: '30d',
            addText: 'Still relevant today! 🔄'
          }
        }
      ],
      platforms: ['instagram', 'facebook'],
      isActive: false,
      runsCount: 24,
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      successRate: 87.5,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const automationTemplates = [
    {
      id: 'content-scheduler',
      name: 'Content Scheduler',
      description: 'Schedule posts across multiple platforms with optimal timing',
      icon: Calendar,
      category: 'Publishing'
    },
    {
      id: 'engagement-booster',
      name: 'Engagement Booster',
      description: 'Automatically engage with relevant content in your niche',
      icon: TrendingUp,
      category: 'Engagement'
    },
    {
      id: 'hashtag-optimizer',
      name: 'Hashtag Optimizer',
      description: 'Auto-suggest and add trending hashtags to your posts',
      icon: Hash,
      category: 'Optimization'
    },
    {
      id: 'mention-responder',
      name: 'Mention Responder',
      description: 'Automatically respond to mentions and tags',
      icon: AtSign,
      category: 'Customer Service'
    },
    {
      id: 'content-recycler',
      name: 'Content Recycler',
      description: 'Repost high-performing content at optimal times',
      icon: Repeat,
      category: 'Content Strategy'
    },
    {
      id: 'follower-growth',
      name: 'Follower Growth',
      description: 'Automated following and unfollowing based on criteria',
      icon: Users,
      category: 'Growth'
    }
  ];

  const filteredRules = automationRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && rule.isActive) ||
                         (filterStatus === 'inactive' && !rule.isActive);

    return matchesSearch && matchesStatus;
  });

  const toggleRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    const icons = {
      facebook: <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>,
      instagram: <div className="w-4 h-4 bg-gradient-to-tr from-purple-600 to-pink-600 rounded text-white text-xs flex items-center justify-center font-bold">ig</div>,
      linkedin: <div className="w-4 h-4 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">in</div>,
      youtube: <div className="w-4 h-4 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">yt</div>,
      twitter: <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">𝕏</div>,
      threads: <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center font-bold">@</div>
    };
    return icons[platform] || <Globe className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Bot className="w-8 h-8 text-purple-400" />
            <span>Automation Hub</span>
          </h2>
          <p className="text-gray-400">Create and manage automated workflows for your social media</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Automation</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 border-b border-gray-700">
        {[
          { id: 'rules', label: 'Active Rules', icon: Zap },
          { id: 'templates', label: 'Templates', icon: Sparkles },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.id === 'rules' && (
              <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5">
                {automationRules.filter(r => r.isActive).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search automation rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-gray-800/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Rules</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRules.map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-effect rounded-xl p-6 border border-white/10"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{rule.name}</h3>
                        <div className="flex items-center space-x-1">
                          {rule.platforms.map(platform => (
                            <div key={platform} className="mr-1">
                              {getPlatformIcon(platform)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`p-1 rounded ${rule.isActive ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-400 hover:bg-gray-500/20'}`}
                        title={rule.isActive ? 'Pause' : 'Activate'}
                      >
                        {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedRule(rule)}
                        className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">{rule.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Runs</div>
                      <div className="font-semibold text-white">{rule.runsCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                      <div className="font-semibold text-green-400">{rule.successRate}%</div>
                    </div>
                  </div>

                  {/* Next Run */}
                  {rule.nextRun && rule.isActive && (
                    <div className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-500/10 rounded-lg p-2">
                      <Clock className="w-3 h-3" />
                      <span>Next: {new Date(rule.nextRun).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className={`flex items-center justify-center mt-3 py-2 rounded-lg text-xs font-medium ${
                    rule.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {rule.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Paused
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredRules.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No automation rules found</h3>
                <p className="text-gray-400 mb-6">Create your first automation rule to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create First Rule
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automationTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-effect rounded-xl p-6 border border-white/10 cursor-pointer group"
                  onClick={() => setShowCreateModal(true)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                      <template.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {template.name}
                      </h3>
                      <div className="text-xs text-purple-400 font-medium">
                        {template.category}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Rules</p>
                    <p className="text-2xl font-bold text-white">{automationRules.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-xs text-gray-500">
                  {automationRules.filter(r => r.isActive).length} active
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Runs</p>
                    <p className="text-2xl font-bold text-white">
                      {automationRules.reduce((acc, rule) => acc + rule.runsCount, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-xs text-gray-500">This month</div>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round(automationRules.reduce((acc, rule) => acc + rule.successRate, 0) / automationRules.length)}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-xs text-gray-500">Average across all rules</div>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Time Saved</p>
                    <p className="text-2xl font-bold text-blue-400">24h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs text-gray-500">This week</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Automation Rule</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center py-8">
                <Bot className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Automation Builder</h4>
                <p className="text-gray-400">
                  Full automation builder would be implemented here with drag-and-drop workflow creation,
                  trigger conditions, action sequences, and testing capabilities.
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AutomationHub;