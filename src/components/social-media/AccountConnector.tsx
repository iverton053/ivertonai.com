import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Settings,
  ExternalLink,
  Shield,
  Users,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { SocialMediaAccount, SocialPlatform, ConnectAccountForm } from '../../types/socialMedia';

interface AccountConnectorProps {
  accounts: SocialMediaAccount[];
  onConnectAccount: (form: ConnectAccountForm) => void;
  onDisconnectAccount: (accountId: string) => void;
  onRefreshAccount: (accountId: string) => void;
  onUpdatePermissions: (accountId: string, permissions: string[]) => void;
  isConnecting?: boolean;
}

const AccountConnector: React.FC<AccountConnectorProps> = ({
  accounts,
  onConnectAccount,
  onDisconnectAccount,
  onRefreshAccount,
  onUpdatePermissions,
  isConnecting = false
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('facebook');
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  const platformInfo = {
    facebook: {
      name: 'Facebook',
      color: 'bg-blue-600',
      icon: '📘',
      description: 'Connect your Facebook pages to schedule posts and view analytics',
      permissions: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      features: ['Post scheduling', 'Analytics', 'Page management', 'Audience insights']
    },
    instagram: {
      name: 'Instagram',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      icon: '📸',
      description: 'Connect your Instagram business accounts for posts, stories, and reels',
      permissions: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
      features: ['Feed posts', 'Stories', 'Reels', 'Analytics', 'Hashtag insights']
    },
    linkedin: {
      name: 'LinkedIn',
      color: 'bg-blue-700',
      icon: '💼',
      description: 'Connect your LinkedIn pages and personal profile for professional content',
      permissions: ['w_member_social', 'r_organization_social', 'w_organization_social'],
      features: ['Company posts', 'Articles', 'Professional analytics', 'Lead generation']
    },
    youtube: {
      name: 'YouTube',
      color: 'bg-red-600',
      icon: '📺',
      description: 'Connect your YouTube channel for video analytics and community posts',
      permissions: ['youtube.readonly', 'youtube.upload'],
      features: ['Video analytics', 'Channel insights', 'Community posts', 'Subscriber data']
    }
  };

  const getConnectedAccounts = (platform: SocialPlatform) => {
    return accounts.filter(account => account.platform === platform && account.isActive);
  };

  const handleConnectPlatform = async (platform: SocialPlatform) => {
    setConnectingPlatform(platform);
    
    try {
      // This would integrate with actual OAuth flows
      const authUrl = generateAuthUrl(platform);
      const popup = window.open(authUrl, 'oauth', 'width=600,height=600');
      
      // Listen for OAuth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setConnectingPlatform(null);
          // Handle the OAuth response here
        }
      }, 1000);
      
    } catch (error) {
      console.error('Connection error:', error);
      setConnectingPlatform(null);
    }
  };

  const generateAuthUrl = (platform: SocialPlatform): string => {
    // This would generate actual OAuth URLs for each platform
    const baseUrls = {
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
      instagram: 'https://api.instagram.com/oauth/authorize',
      linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
      youtube: 'https://accounts.google.com/oauth2/v2/auth'
    };
    
    const params = new URLSearchParams({
      client_id: 'your_client_id',
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: platformInfo[platform].permissions.join(' '),
      response_type: 'code',
      state: platform
    });
    
    return `${baseUrls[platform]}?${params.toString()}`;
  };

  const formatLastSync = (lastSync: string) => {
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Connected Accounts</h2>
          <p className="text-gray-400">Manage your social media platform connections</p>
        </div>
        
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Connected Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(platformInfo).map(([platform, info]) => {
          const connectedAccounts = getConnectedAccounts(platform as SocialPlatform);
          
          return (
            <motion.div
              key={platform}
              whileHover={{ scale: 1.02 }}
              className="glass-effect rounded-xl shadow-sm border p-6"
            >
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center text-white text-2xl`}>
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{info.name}</h3>
                    <p className="text-sm text-gray-400">
                      {connectedAccounts.length} account{connectedAccounts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {connectedAccounts.length > 0 && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Connected Accounts */}
              {connectedAccounts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {connectedAccounts.slice(0, 2).map(account => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {account.profilePicture ? (
                          <img
                            src={account.profilePicture}
                            alt={account.accountName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">
                            {account.accountName}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>@{account.username}</span>
                            <span>•</span>
                            <span>Synced {formatLastSync(account.lastSync)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {account.isConnected ? (
                          <div className="flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">Connected</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-600">Issues</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => onRefreshAccount(account.id)}
                          className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                          title="Refresh connection"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {connectedAccounts.length > 2 && (
                    <p className="text-sm text-gray-400 text-center">
                      +{connectedAccounts.length - 2} more account{connectedAccounts.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 mb-4">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">{info.icon}</span>
                  </div>
                  <p className="text-gray-400 mb-2">No accounts connected</p>
                  <p className="text-sm text-gray-400">{info.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleConnectPlatform(platform as SocialPlatform)}
                  disabled={connectingPlatform === platform}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    connectedAccounts.length > 0
                      ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${connectingPlatform === platform ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {connectingPlatform === platform ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{connectedAccounts.length > 0 ? 'Add Another' : 'Connect Account'}</span>
                    </>
                  )}
                </button>

                {connectedAccounts.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Settings</span>
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Analytics</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs font-medium text-gray-300 mb-2">Available Features:</p>
                <div className="flex flex-wrap gap-1">
                  {info.features.slice(0, 3).map(feature => (
                    <span key={feature} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  {info.features.length > 3 && (
                    <span className="text-xs text-gray-400">+{info.features.length - 3}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Account Details Modal */}
      {accounts.length > 0 && (
        <div className="glass-effect rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
          
          <div className="space-y-4">
            {accounts.slice(0, 5).map(account => (
              <div key={account.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg ${platformInfo[account.platform].color} flex items-center justify-center text-white`}>
                    {platformInfo[account.platform].icon}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-white">{account.accountName}</p>
                      {account.isConnected ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">Connection Issues</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>@{account.username}</span>
                      <span className="capitalize">{account.platform}</span>
                      <span>Last sync: {formatLastSync(account.lastSync)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Shield className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {account.permissions.length} permission{account.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRefreshAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                    title="Refresh connection"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                    title="Account settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDisconnectAccount(account.id)}
                    className="p-2 text-gray-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Disconnect account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Tips */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Zap className="w-6 h-6 text-purple-400 mt-1" />
          <div>
            <h3 className="font-medium text-blue-300 mb-2">Connection Tips</h3>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Make sure you have admin access to the pages/accounts you want to connect</li>
              <li>• Some platforms require business accounts for full API access</li>
              <li>• Refresh connections if you notice any sync issues</li>
              <li>• Review permissions regularly to ensure optimal functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountConnector;