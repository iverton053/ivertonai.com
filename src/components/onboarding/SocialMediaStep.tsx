import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const SOCIAL_PLATFORMS = [
  { key: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/your-business' },
  { key: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/your-business' },
  { key: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/company/your-business' },
  { key: 'twitter', name: 'Twitter/X', placeholder: 'https://twitter.com/your-business' },
  { key: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@your-business' },
  { key: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@your-business' }
];

const SocialMediaStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    facebook: { url: '', hasAccess: false, accessToken: '' },
    instagram: { url: '', hasAccess: false, accessToken: '' },
    linkedin: { url: '', hasAccess: false, accessToken: '' },
    twitter: { url: '', hasAccess: false, accessToken: '' },
    youtube: { url: '', hasAccess: false, accessToken: '' },
    tiktok: { url: '', hasAccess: false, accessToken: '' },
    postingFrequency: 'weekly',
    contentTypes: [],
    currentSocialProvider: '',
    ...formData.socialMedia
  });

  const [showTokens, setShowTokens] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    onUpdate('socialMedia', localData);
  }, [localData, onUpdate]);

  const handlePlatformChange = (platform: string, field: string, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleTokenVisibility = (platform: string) => {
    setShowTokens(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const CONTENT_TYPES = [
    'Educational Posts',
    'Product Updates',
    'Behind the Scenes',
    'Customer Stories',
    'Industry News',
    'Promotional Content',
    'User Generated Content',
    'Live Videos',
    'Stories'
  ];

  const POSTING_FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const SOCIAL_PROVIDERS = [
    'None',
    'Hootsuite',
    'Buffer',
    'Sprout Social',
    'Later',
    'SocialBee',
    'Other'
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Hash className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Social Media Setup</h3>
        <p className="text-gray-400 mb-6">
          Connect social media accounts and configure posting preferences
        </p>
      </motion.div>

      {/* Social Media Platforms */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Social Media Accounts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SOCIAL_PLATFORMS.map((platform) => (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-white">{platform.name}</h5>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localData[platform.key as keyof typeof localData]?.hasAccess || false}
                    onChange={(e) => handlePlatformChange(platform.key, 'hasAccess', e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-400">Has Access</span>
                </label>
              </div>

              <input
                type="url"
                value={localData[platform.key as keyof typeof localData]?.url || ''}
                onChange={(e) => handlePlatformChange(platform.key, 'url', e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-3"
              />

              {localData[platform.key as keyof typeof localData]?.hasAccess && (
                <div className="relative">
                  <input
                    type={showTokens[platform.key] ? "text" : "password"}
                    value={localData[platform.key as keyof typeof localData]?.accessToken || ''}
                    onChange={(e) => handlePlatformChange(platform.key, 'accessToken', e.target.value)}
                    placeholder="Access Token (optional)"
                    className="w-full px-3 py-2 pr-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTokenVisibility(platform.key)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showTokens[platform.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Posting Preferences */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Posting Preferences</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Posting Frequency
            </label>
            <select
              value={localData.postingFrequency}
              onChange={(e) => handleInputChange('postingFrequency', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {POSTING_FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Current Social Media Provider
            </label>
            <select
              value={localData.currentSocialProvider}
              onChange={(e) => handleInputChange('currentSocialProvider', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select Provider</option>
              {SOCIAL_PROVIDERS.map(provider => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Content Types (select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONTENT_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localData.contentTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('contentTypes', [...localData.contentTypes, type]);
                    } else {
                      handleInputChange('contentTypes', localData.contentTypes.filter(t => t !== type));
                    }
                  }}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-white">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
      >
        Continue to Marketing Automation
      </motion.button>
    </div>
  );
};

export default SocialMediaStep;