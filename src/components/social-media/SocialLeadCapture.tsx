import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageCircle, Heart, Share2, UserPlus, AlertTriangle,
  CheckCircle, Clock, Filter, Search, Download, Settings,
  Linkedin, Instagram, Facebook, Twitter, Youtube, MessageSquare,
  Eye, Edit, Trash2, UserCheck, MapPin, Briefcase, Star,
  TrendingUp, Activity, Target, Zap, Bell, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SocialLead {
  id: string;
  platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter';
  socialId: string;
  name: string;
  username: string;
  profileUrl: string;
  avatar: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  location?: string;
  followers: number;
  connectionType: 'connection' | 'message' | 'comment' | 'mention' | 'follow' | 'like' | 'share';
  interactionType: string;
  message?: string;
  timestamp: string;
  leadScore: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'unqualified';
  assignedTo?: string;
  territory?: string;
  tags: string[];
  socialData: {
    bio?: string;
    website?: string;
    verified: boolean;
    mutualConnections?: number;
    recentPosts?: Array<{
      content: string;
      engagement: number;
      timestamp: string;
    }>;
    interests?: string[];
  };
  crmStatus: 'pending' | 'synced' | 'error';
  lastSync?: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
  leadsToday: number;
  totalLeads: number;
  engagementRate: number;
  webhookUrl?: string;
  lastSync?: string;
}

const SocialLeadCapture: React.FC = () => {
  const [socialLeads, setSocialLeads] = useState<SocialLead[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [selectedLead, setSelectedLead] = useState<SocialLead | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlatformConfig, setShowPlatformConfig] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockPlatforms: SocialPlatform[] = [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: Linkedin,
        color: 'text-purple-400',
        connected: true,
        leadsToday: 12,
        totalLeads: 847,
        engagementRate: 8.4,
        webhookUrl: 'https://n8n.yourapp.com/webhook/linkedin-lead',
        lastSync: '2024-01-21T14:30:00Z'
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: Facebook,
        color: 'text-blue-700',
        connected: true,
        leadsToday: 8,
        totalLeads: 523,
        engagementRate: 5.2,
        webhookUrl: 'https://n8n.yourapp.com/webhook/facebook-lead',
        lastSync: '2024-01-21T13:45:00Z'
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        color: 'text-pink-600',
        connected: true,
        leadsToday: 15,
        totalLeads: 692,
        engagementRate: 12.1,
        webhookUrl: 'https://n8n.yourapp.com/webhook/instagram-lead',
        lastSync: '2024-01-21T14:20:00Z'
      },
      {
        id: 'twitter',
        name: 'Twitter',
        icon: Twitter,
        color: 'text-blue-400',
        connected: false,
        leadsToday: 0,
        totalLeads: 234,
        engagementRate: 3.8
      }
    ];

    const mockLeads: SocialLead[] = [
      {
        id: '1',
        platform: 'linkedin',
        socialId: 'john-smith-cto',
        name: 'John Smith',
        username: 'john.smith.cto',
        profileUrl: 'https://linkedin.com/in/john-smith-cto',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        email: 'john.smith@techcorp.com',
        company: 'TechCorp Solutions',
        jobTitle: 'CTO',
        location: 'San Francisco, CA',
        followers: 2847,
        connectionType: 'connection',
        interactionType: 'New connection request accepted',
        message: 'Thanks for connecting! I\'m interested in learning more about your marketing automation solutions.',
        timestamp: '2024-01-21T14:30:00Z',
        leadScore: 85,
        status: 'new',
        assignedTo: 'Sarah Wilson',
        territory: 'West Coast',
        tags: ['enterprise', 'technology', 'hot-lead'],
        socialData: {
          bio: 'CTO at TechCorp Solutions. Passionate about scaling technology infrastructure and leading engineering teams.',
          website: 'https://techcorp.com',
          verified: true,
          mutualConnections: 47,
          recentPosts: [
            {
              content: 'Looking for better marketing automation tools. Current solution is limiting our growth...',
              engagement: 23,
              timestamp: '2024-01-20T10:15:00Z'
            },
            {
              content: 'Hiring senior engineers for our AI/ML team. Exciting projects ahead!',
              engagement: 156,
              timestamp: '2024-01-19T15:30:00Z'
            }
          ],
          interests: ['AI/ML', 'Marketing Technology', 'Team Leadership', 'Startup Growth']
        },
        crmStatus: 'synced',
        lastSync: '2024-01-21T14:32:00Z'
      },
      {
        id: '2',
        platform: 'instagram',
        socialId: 'sarah_marketing_pro',
        name: 'Sarah Davis',
        username: '@sarah_marketing_pro',
        profileUrl: 'https://instagram.com/sarah_marketing_pro',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85ca147?w=100&h=100&fit=crop&crop=face',
        company: 'Growth Marketing Agency',
        jobTitle: 'Marketing Director',
        location: 'Austin, TX',
        followers: 5420,
        connectionType: 'comment',
        interactionType: 'Commented on product post',
        message: 'This looks amazing! Would love to know more about pricing and enterprise features. DMing you now!',
        timestamp: '2024-01-21T13:45:00Z',
        leadScore: 72,
        status: 'contacted',
        assignedTo: 'Mike Johnson',
        territory: 'Central',
        tags: ['marketing', 'agency', 'pricing-interest'],
        socialData: {
          bio: '💼 Marketing Director @GrowthAgency | 🚀 Helping brands scale | 📈 Growth hacking enthusiast',
          verified: false,
          recentPosts: [
            {
              content: 'Just tested 5 different marketing automation platforms. Here are my honest thoughts...',
              engagement: 89,
              timestamp: '2024-01-20T12:00:00Z'
            }
          ],
          interests: ['Growth Hacking', 'Marketing Automation', 'B2B SaaS', 'Analytics']
        },
        crmStatus: 'pending',
        lastSync: '2024-01-21T13:47:00Z'
      },
      {
        id: '3',
        platform: 'facebook',
        socialId: 'mike_entrepreneur',
        name: 'Michael Brown',
        username: 'mike.entrepreneur',
        profileUrl: 'https://facebook.com/mike.entrepreneur',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        company: 'StartupX',
        jobTitle: 'Founder & CEO',
        location: 'New York, NY',
        followers: 1230,
        connectionType: 'message',
        interactionType: 'Sent direct message',
        message: 'Hi! Saw your ad about marketing automation. We\'re a growing startup and really need to streamline our processes. Can we schedule a demo?',
        timestamp: '2024-01-21T11:20:00Z',
        leadScore: 91,
        status: 'qualified',
        assignedTo: 'Lisa Brown',
        territory: 'East Coast',
        tags: ['startup', 'founder', 'demo-request'],
        socialData: {
          bio: 'Serial entrepreneur building the future of fintech. Always learning, always growing.',
          website: 'https://startupx.io',
          verified: false,
          interests: ['Entrepreneurship', 'Fintech', 'Marketing', 'Growth']
        },
        crmStatus: 'synced',
        lastSync: '2024-01-21T11:25:00Z'
      }
    ];

    setPlatforms(mockPlatforms);
    setSocialLeads(mockLeads);
    setLoading(false);
  }, []);

  // Simulate real-time lead capture
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance of new lead
        const newLead = generateMockLead();
        setSocialLeads(prev => [newLead, ...prev.slice(0, 49)]);
        
        // Update platform stats
        setPlatforms(prev => prev.map(platform => 
          platform.id === newLead.platform
            ? { ...platform, leadsToday: platform.leadsToday + 1, totalLeads: platform.totalLeads + 1 }
            : platform
        ));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  const generateMockLead = (): SocialLead => {
    const platforms = ['linkedin', 'facebook', 'instagram'] as const;
    const names = ['Alex Johnson', 'Emma Wilson', 'David Chen', 'Maria Garcia', 'James Lee'];
    const companies = ['TechStart Inc', 'Growth Co', 'Innovation Labs', 'Digital Agency', 'Scale Solutions'];
    const interactions = ['New connection', 'Comment on post', 'Direct message', 'Mentioned your company', 'Liked your content'];
    
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    return {
      id: Date.now().toString(),
      platform,
      socialId: name.toLowerCase().replace(' ', '-'),
      name,
      username: `@${name.toLowerCase().replace(' ', '.')}`,
      profileUrl: `https://${platform}.com/${name.toLowerCase().replace(' ', '.')}`,
      avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1470000000000}?w=100&h=100&fit=crop&crop=face`,
      company,
      jobTitle: 'Marketing Manager',
      location: 'Remote',
      followers: Math.floor(Math.random() * 10000) + 500,
      connectionType: 'comment',
      interactionType: interactions[Math.floor(Math.random() * interactions.length)],
      message: 'Interested in learning more about your services!',
      timestamp: new Date().toISOString(),
      leadScore: Math.floor(Math.random() * 40) + 40,
      status: 'new',
      territory: 'Auto-assigned',
      tags: ['new-lead'],
      socialData: {
        bio: 'Marketing professional passionate about growth',
        verified: false,
        interests: ['Marketing', 'Growth', 'Technology']
      },
      crmStatus: 'pending'
    };
  };

  const handleLeadAction = async (leadId: string, action: 'contact' | 'qualify' | 'convert' | 'unqualify') => {
    setSocialLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { 
            ...lead, 
            status: action === 'contact' ? 'contacted' : 
                   action === 'qualify' ? 'qualified' :
                   action === 'convert' ? 'converted' : 'unqualified'
          }
        : lead
    ));

    // In real implementation, this would call the API
    console.log(`${action} lead ${leadId}`);
  };

  const syncToCRM = async (leadId: string) => {
    setSocialLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, crmStatus: 'synced', lastSync: new Date().toISOString() }
        : lead
    ));
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    if (!platformData) return MessageSquare;
    return platformData.icon;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData?.color || 'text-gray-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-900/20 text-blue-300';
      case 'contacted': return 'bg-yellow-900/50 text-yellow-300';
      case 'qualified': return 'bg-green-900/50 text-green-300';
      case 'converted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'unqualified': return 'bg-gray-800/50 text-gray-300';
      default: return 'bg-gray-800/50 text-gray-300';
    }
  };

  const filteredLeads = socialLeads.filter(lead => {
    const matchesPlatform = selectedPlatform === 'all' || lead.platform === selectedPlatform;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const totalLeadsToday = platforms.reduce((sum, platform) => sum + platform.leadsToday, 0);
  const avgEngagement = platforms.reduce((sum, platform) => sum + platform.engagementRate, 0) / platforms.length;
  const connectedPlatforms = platforms.filter(p => p.connected).length;

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
          <h2 className="text-2xl font-bold text-white">Social Lead Capture</h2>
          <p className="text-gray-400">
            Capture and qualify leads from social media interactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              realTimeMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {realTimeMode ? <Bell className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {realTimeMode ? 'Live Mode' : 'Manual Refresh'}
          </button>
          <button
            onClick={() => setShowPlatformConfig(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Platforms
          </button>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Leads Today</p>
              <p className="text-2xl font-bold text-white">{totalLeadsToday}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Connected Platforms</p>
              <p className="text-2xl font-bold text-white">{connectedPlatforms}/4</p>
            </div>
            <Share2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Engagement</p>
              <p className="text-2xl font-bold text-white">{avgEngagement.toFixed(1)}%</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">18.4%</p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platforms.map(platform => {
          const Icon = platform.icon;
          return (
            <div
              key={platform.id}
              className="glass-effect rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-8 h-8 ${platform.color}`} />
                  <div>
                    <h3 className="font-semibold text-white">{platform.name}</h3>
                    <p className="text-sm text-gray-400">
                      {platform.connected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Today</span>
                  <span className="font-medium text-white">{platform.leadsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="font-medium text-white">{platform.totalLeads}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Engagement</span>
                  <span className="font-medium text-white">{platform.engagementRate}%</span>
                </div>
              </div>

              {platform.lastSync && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Last sync: {new Date(platform.lastSync).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 bg-gray-700 text-white"
        >
          <option value="all">All Platforms</option>
          {platforms.map(platform => (
            <option key={platform.id} value={platform.id}>{platform.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-blue-500 bg-gray-700 text-white"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="unqualified">Unqualified</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="glass-effect rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Social Media Leads ({filteredLeads.length})
            </h3>
            <button className="flex items-center px-4 py-2 text-purple-400 hover:bg-purple-600/20 rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLeads.map(lead => {
            const Icon = getPlatformIcon(lead.platform);
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={lead.avatar}
                      alt={lead.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      <Icon className={`w-5 h-5 ${getPlatformColor(lead.platform)} glass-effect rounded-full p-1`} />
                    </div>
                  </div>

                  {/* Lead Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{lead.name}</h4>
                        <p className="text-gray-400">{lead.username}</p>
                        {lead.company && (
                          <p className="text-sm text-gray-400 mt-1">
                            {lead.jobTitle} at {lead.company}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className={`w-4 h-4 ${lead.leadScore >= 80 ? 'text-yellow-500' : 'text-gray-300'}`} />
                          <span className="text-sm font-medium text-white">
                            {lead.leadScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interaction */}
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-300">
                        {lead.interactionType}
                      </p>
                      {lead.message && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          "{lead.message}"
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {lead.followers.toLocaleString()} followers
                        </div>
                        {lead.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {lead.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {lead.crmStatus === 'synced' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : lead.crmStatus === 'pending' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        
                        {lead.status === 'new' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeadAction(lead.id, 'contact');
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Contact
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lead.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-800/50 text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No leads found</h3>
            <p className="text-gray-400">
              Try adjusting your filters or check your platform connections
            </p>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedLead.name} - Social Lead Details
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Profile */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedLead.avatar}
                      alt={selectedLead.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {selectedLead.name}
                      </h4>
                      <p className="text-gray-400">{selectedLead.username}</p>
                      {selectedLead.company && (
                        <p className="text-sm text-gray-400">
                          {selectedLead.jobTitle} at {selectedLead.company}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedLead.socialData.bio && (
                    <div>
                      <h5 className="font-medium text-white mb-2">Bio</h5>
                      <p className="text-gray-400 text-sm">
                        {selectedLead.socialData.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-white mb-1">Followers</h5>
                      <p className="text-gray-400">
                        {selectedLead.followers.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-white mb-1">Lead Score</h5>
                      <p className="text-gray-400">{selectedLead.leadScore}/100</p>
                    </div>
                  </div>

                  {selectedLead.socialData.interests && (
                    <div>
                      <h5 className="font-medium text-white mb-2">Interests</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedLead.socialData.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-900/20 text-blue-300 rounded"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interaction Details */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-white mb-2">Interaction</h5>
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <p className="font-medium text-white mb-1">
                        {selectedLead.interactionType}
                      </p>
                      {selectedLead.message && (
                        <p className="text-gray-400 text-sm">
                          "{selectedLead.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(selectedLead.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selectedLead.socialData.recentPosts && (
                    <div>
                      <h5 className="font-medium text-white mb-2">Recent Posts</h5>
                      <div className="space-y-2">
                        {selectedLead.socialData.recentPosts.map((post, index) => (
                          <div key={index} className="bg-gray-700/50 p-3 rounded text-sm">
                            <p className="text-white">{post.content}</p>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>{post.engagement} engagements</span>
                              <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div>
                    <h5 className="font-medium text-white mb-3">Quick Actions</h5>
                    <div className="space-y-2">
                      <button
                        onClick={() => syncToCRM(selectedLead.id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sync to CRM
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleLeadAction(selectedLead.id, 'qualify')}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Qualify
                        </button>
                        <button
                          onClick={() => handleLeadAction(selectedLead.id, 'unqualify')}
                          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Unqualify
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialLeadCapture;