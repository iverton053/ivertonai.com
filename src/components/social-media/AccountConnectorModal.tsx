import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Check, AlertCircle, RefreshCw, Settings,
  ExternalLink, Shield, Users, Calendar, BarChart3, Zap
} from 'lucide-react';
import { SocialMediaAccount, SocialPlatform, ConnectAccountForm } from '../../types/socialMedia';

interface AccountConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialMediaAccount[];
  onConnectAccount: (form: ConnectAccountForm) => void;
  onDisconnectAccount: (accountId: string) => void;
  onRefreshAccount: (accountId: string) => void;
  onUpdatePermissions: (accountId: string, permissions: string[]) => void;
  isConnecting?: boolean;
}

const AccountConnectorModal: React.FC<AccountConnectorModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onConnectAccount,
  onDisconnectAccount,
  onRefreshAccount,
  onUpdatePermissions,
  isConnecting = false
}) => {
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('facebook');
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [connectionStep, setConnectionStep] = useState(1);

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
      description: 'Connect your LinkedIn company pages for professional content',
      permissions: ['w_member_social', 'r_organization_social'],
      features: ['Company updates', 'Article publishing', 'Lead generation', 'Analytics']
    },
    youtube: {
      name: 'YouTube',
      color: 'bg-red-600',
      icon: '🎥',
      description: 'Connect your YouTube channel for video content management',
      permissions: ['youtube.upload', 'youtube.readonly'],
      features: ['Video uploads', 'Playlist management', 'Analytics', 'Community posts']
    },
    twitter: {
      name: 'X (Twitter)',
      color: 'bg-black',
      icon: '𝕏',
      description: 'Connect your X account for tweets and engagement',
      permissions: ['tweet.read', 'tweet.write', 'users.read'],
      features: ['Tweet posting', 'Thread creation', 'Analytics', 'DM management']
    },
    threads: {
      name: 'Threads',
      color: 'bg-gradient-to-br from-gray-800 to-black',
      icon: '@',
      description: 'Connect your Threads account for text-based posts',
      permissions: ['threads_basic', 'threads_content_publish'],
      features: ['Text posts', 'Image posts', 'Thread replies', 'Basic analytics']
    }
  };

  const handlePlatformConnect = async (platform: SocialPlatform) => {
    setConnectingPlatform(platform);
    setConnectionStep(1);
    setShowConnectForm(true);
  };

  const simulateConnection = async () => {
    const steps = [
      'Redirecting to authorization...',
      'Authenticating with platform...',
      'Retrieving account information...',
      'Configuring permissions...',
      'Finalizing connection...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setConnectionStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create mock account
    const newAccount: ConnectAccountForm = {
      platform: selectedPlatform,
      accountId: `${selectedPlatform}_${Date.now()}`,
      accountName: `${platformInfo[selectedPlatform].name} Account`,
      username: `user_${selectedPlatform}`,
      accessToken: `mock_token_${Date.now()}`,
      permissions: platformInfo[selectedPlatform].permissions,
      agencyId: 'mock-agency',
      clientId: 'mock-client'
    };

    onConnectAccount(newAccount);
    setConnectingPlatform(null);
    setShowConnectForm(false);
  };

  const getConnectedAccount = (platform: SocialPlatform) => {
    return accounts.find(acc => acc.platform === platform && acc.isConnected);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Connect Social Accounts</h2>
              <p className="text-gray-400 mt-1">
                Connect your social media accounts to start managing content
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {showConnectForm && connectingPlatform ? (
            /* Connection Flow */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="mb-6">
                <div className="text-6xl mb-4">{platformInfo[connectingPlatform].icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Connecting to {platformInfo[connectingPlatform].name}
                </h3>
                <p className="text-gray-400">
                  {platformInfo[connectingPlatform].description}
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= connectionStep
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {step < connectionStep ? <Check className="w-4 h-4" /> : step}
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Secure OAuth authentication</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Access to managed accounts only</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Analytics and insights included</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConnectForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={simulateConnection}
                    disabled={connectionStep > 1}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
                  >
                    {connectionStep > 1 ? 'Connecting...' : 'Connect Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Platform Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {Object.entries(platformInfo).map(([platform, info]) => {
                const connectedAccount = getConnectedAccount(platform as SocialPlatform);
                const isConnected = !!connectedAccount;

                return (
                  <motion.div
                    key={platform}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isConnected
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{info.icon}</div>
                      <h3 className="font-semibold text-white mb-1">{info.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{info.description}</p>
                    </div>

                    {isConnected && connectedAccount ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
                          <Check className="w-4 h-4" />
                          <span>Connected</span>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-white text-sm font-medium">{connectedAccount.accountName}</p>
                          <p className="text-gray-400 text-xs">@{connectedAccount.username}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Last sync: {new Date(connectedAccount.lastSync).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => onRefreshAccount(connectedAccount.id)}
                            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Refresh</span>
                          </button>
                          <button
                            onClick={() => onDisconnectAccount(connectedAccount.id)}
                            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          {info.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-400">
                              <div className="w-1 h-1 bg-purple-400 rounded-full" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPlatform(platform as SocialPlatform);
                            handlePlatformConnect(platform as SocialPlatform);
                          }}
                          disabled={connectingPlatform === platform}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white text-sm rounded-lg transition-colors"
                        >
                          {connectingPlatform === platform ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {!showConnectForm && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>{accounts.filter(acc => acc.isConnected).length} Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    <span>{Object.keys(platformInfo).length - accounts.filter(acc => acc.isConnected).length} Available</span>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccountConnectorModal;