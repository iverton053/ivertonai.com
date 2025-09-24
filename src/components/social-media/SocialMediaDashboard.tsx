import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  TrendingUp,
  Plus,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Grid,
  List,
  Play,
  Image as ImageIcon,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Hash,
  Repeat,
  AtSign,
  Globe,
  Sparkles
} from 'lucide-react'
import { useSocialMediaStore } from '../../stores/socialMediaStore'
import { SocialPlatform, PostStatus, SocialMediaPost } from '../../types/socialMedia'
import ContentCalendar from './ContentCalendar'
import PostComposer from './PostComposer'
import SocialAnalytics from './SocialAnalytics'
import AccountConnector from './AccountConnector'
import AccountConnectorModal from './AccountConnectorModal'
import PostList from './PostList'
import SocialLeadCapture from './SocialLeadCapture'
import AutomationHub from './AutomationHub'

const SocialMediaDashboard: React.FC = () => {
  const {
    accounts,
    posts,
    analytics,
    campaigns,
    isLoading,
    error,
    setError,
    addPost,
    updatePost,
    deletePost,
    duplicatePost,
    publishPost,
    pausePost,
    addAccount,
    removeAccount,
    refreshAccount
  } = useSocialMediaStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'posts' | 'analytics' | 'leads' | 'accounts' | 'automation'>('overview')
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([])
  const [dateRange, setDateRange] = useState('7d')
  const [showComposer, setShowComposer] = useState(false)
  const [showAccountConnector, setShowAccountConnector] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock agency data - replace with actual context
  const agencyId = 'mock-agency-id'
  const clientId = undefined // Show all clients

  // Calculate overview statistics
  const stats = {
    totalAccounts: accounts.length,
    connectedAccounts: accounts.filter(acc => acc.isConnected).length,
    totalPosts: posts.length,
    publishedPosts: posts.filter(post => post.status === 'published').length,
    scheduledPosts: posts.filter(post => post.status === 'scheduled').length,
    totalEngagement: posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0),
    avgEngagement: posts.length > 0 ? posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0) / posts.length : 0
  }

  const handleRefresh = () => {
    // Refresh account connections
    accounts.forEach(account => {
      refreshAccount(account.id);
    });
    
    // Clear any existing errors
    if (error) {
      setError(null);
    }
  }

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'published': return 'text-emerald-400'
      case 'scheduled': return 'text-blue-400'
      case 'draft': return 'text-gray-400'
      case 'failed': return 'text-red-400'
      case 'pending_approval': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: PostStatus) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'draft': return <FileText className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'pending_approval': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPlatformColor = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return 'text-blue-500'
      case 'instagram': return 'text-pink-500'
      case 'linkedin': return 'text-blue-700'
      case 'youtube': return 'text-red-500'
      case 'threads': return 'text-gray-100'
      case 'twitter': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>
      case 'instagram': return <div className="w-5 h-5 bg-gradient-to-tr from-purple-600 to-pink-600 rounded text-white text-xs flex items-center justify-center font-bold">ig</div>
      case 'linkedin': return <div className="w-5 h-5 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">in</div>
      case 'youtube': return <div className="w-5 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">yt</div>
      case 'threads': return <div className="w-5 h-5 bg-gradient-to-br from-gray-800 to-black rounded text-white text-xs flex items-center justify-center font-bold">@</div>
      case 'twitter': return <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">𝕏</div>
      default: return <div className="w-5 h-5 bg-gray-400 rounded"></div>
    }
  }

  const getPlatformName = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return 'Facebook'
      case 'instagram': return 'Instagram'
      case 'linkedin': return 'LinkedIn'
      case 'youtube': return 'YouTube'
      case 'threads': return 'Threads'
      case 'twitter': return 'X (Twitter)'
      default: return platform
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Social Media Management</h2>
          <p className="text-gray-400">Manage your social media presence across platforms</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowAccountConnector(true)}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Connect Accounts</span>
          </button>
          
          <button
            onClick={() => setShowComposer(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-6 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'posts', label: 'Posts', icon: MessageSquare },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'leads', label: 'Lead Capture', icon: Target },
          { id: 'accounts', label: 'Accounts', icon: Users },
          { id: 'automation', label: 'Automation', icon: Zap }
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
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Connected Accounts</p>
                    <p className="text-2xl font-bold text-white">{stats.connectedAccounts}/{stats.totalAccounts}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Published Posts</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats.publishedPosts}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Scheduled Posts</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.scheduledPosts}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Engagement</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.totalEngagement.toLocaleString()}</p>
                  </div>
                  <Heart className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Avg Engagement</p>
                    <p className="text-2xl font-bold text-orange-400">{Math.round(stats.avgEngagement)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Campaigns</p>
                    <p className="text-2xl font-bold text-cyan-400">{campaigns.filter(c => c.status === 'active').length}</p>
                  </div>
                  <Grid className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Posts</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                  <p className="text-gray-400 mb-6">Create your first social media post to get started</p>
                  <button
                    onClick={() => setShowComposer(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {posts.slice(0, 6).map((post) => (
                    <div key={post.id} className={`bg-gray-800/50 rounded-lg p-4 ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}>
                      <div className={`flex items-center space-x-2 ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-3'}`}>
                        {getPlatformIcon(post.platform)}
                        <span className="text-sm font-medium text-gray-300 capitalize">{post.platform}</span>
                        <div className={`flex items-center space-x-1 ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                          <span className="text-xs capitalize">{post.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className={`text-white font-medium ${viewMode === 'list' ? 'text-sm' : 'mb-2'}`}>
                          {post.content.substring(0, viewMode === 'list' ? 80 : 120)}
                          {post.content.length > (viewMode === 'list' ? 80 : 120) && '...'}
                        </p>
                        {viewMode === 'grid' && (
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{new Date(post.scheduledAt || post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{post.metrics?.likes || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{post.metrics?.comments || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Share2 className="w-3 h-3" />
                                <span>{post.metrics?.shares || 0}</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connected Accounts Overview */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
              
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No accounts connected</h4>
                  <p className="text-gray-400 mb-4">Connect your social media accounts to start managing your content</p>
                  <button
                    onClick={() => setShowAccountConnector(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Connect First Account
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {getPlatformIcon(account.platform)}
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{account.accountName}</h4>
                          <p className="text-sm text-gray-400">@{account.username}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Last sync: {new Date(account.lastSync).toLocaleDateString()}</span>
                        <span className={account.isConnected ? 'text-emerald-400' : 'text-red-400'}>
                          {account.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentCalendar
              posts={posts}
              onCreatePost={() => setShowComposer(true)}
              onEditPost={(post) => {
                // Handle edit post - could open composer with post data
                console.log('Edit post:', post.id)
              }}
              onDeletePost={(postId) => deletePost(postId)}
              selectedPlatforms={selectedPlatforms}
              onPlatformFilter={setSelectedPlatforms}
            />
          </motion.div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PostList
              posts={posts}
              onEditPost={(post) => {
                // Handle edit post - could open composer with post data
                console.log('Edit post:', post.id)
              }}
              onDeletePost={(postId) => deletePost(postId)}
              onDuplicatePost={(post) => duplicatePost(post)}
              onPublishPost={(postId) => publishPost(postId)}
              onPausePost={(postId) => pausePost(postId)}
              selectedPlatforms={selectedPlatforms}
              onPlatformFilter={setSelectedPlatforms}
            />
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SocialAnalytics
              analytics={analytics}
              posts={posts}
              selectedPlatforms={selectedPlatforms}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onPlatformFilter={setSelectedPlatforms}
            />
          </motion.div>
        )}

        {/* Lead Capture Tab */}
        {activeTab === 'leads' && (
          <motion.div
            key="leads"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SocialLeadCapture />
          </motion.div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <motion.div
            key="automation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AutomationHub />
          </motion.div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <motion.div
            key="accounts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AccountConnector
              accounts={accounts}
              onConnectAccount={(form) => addAccount(form)}
              onDisconnectAccount={(accountId) => removeAccount(accountId)}
              onRefreshAccount={(accountId) => refreshAccount(accountId)}
              onUpdatePermissions={(accountId, permissions) => {
                // Update permissions functionality can be added to store if needed
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          isOpen={showComposer}
          onClose={() => setShowComposer(false)}
          onSave={(postData) => {
            addPost(postData);
            setShowComposer(false);
          }}
          availablePlatforms={accounts.map(acc => acc.platform)}
        />
      )}

      {/* Account Connector Modal */}
      <AccountConnectorModal
        isOpen={showAccountConnector}
        onClose={() => setShowAccountConnector(false)}
        accounts={accounts}
        onConnectAccount={(form) => {
          addAccount(form);
        }}
        onDisconnectAccount={(accountId) => removeAccount(accountId)}
        onRefreshAccount={(accountId) => refreshAccount(accountId)}
        onUpdatePermissions={(accountId, permissions) => {
          // Update permissions functionality can be added to store if needed
        }}
      />
    </div>
  )
}

export default SocialMediaDashboard