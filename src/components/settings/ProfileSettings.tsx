import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import Icon from '../Icon';

const ProfileSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { profile } = settings;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatar);
  const [isUploading, setIsUploading] = useState(false);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  const locales = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'zh-CN', name: '中文 (简体)' },
  ];

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    updateSettings('profile', { [field]: value });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        updateSettings('profile', { avatar: result });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarPreview('');
    updateSettings('profile', { avatar: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="User" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Profile Picture
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/50"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center border-2 border-purple-500/50">
                    <span className="text-white font-bold text-2xl">
                      {profile.displayName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </motion.button>
                {avatarPreview && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarRemove}
                    className="px-3 py-1 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Remove
                  </motion.button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 text-center">
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  placeholder="Your job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  placeholder="Your company"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {profile.bio.length}/500 characters
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Localization Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Globe" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Localization</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={profile.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz} className="bg-gray-800">
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={profile.locale}
              onChange={(e) => handleInputChange('locale', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            >
              {locales.map((locale) => (
                <option key={locale.code} value={locale.code} className="bg-gray-800">
                  {locale.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Current Time & Format</p>
              <p className="text-blue-300">
                {new Date().toLocaleString(profile.locale, { 
                  timeZone: profile.timezone,
                  dateStyle: 'full',
                  timeStyle: 'medium'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="BarChart3" className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Profile Statistics</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {Math.floor(Math.random() * 30) + 1}
            </div>
            <div className="text-xs text-gray-400">Days Active</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Math.floor(Math.random() * 150) + 50}
            </div>
            <div className="text-xs text-gray-400">Tasks Completed</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.floor(Math.random() * 10) + 2}
            </div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {Math.floor(Math.random() * 24) + 6}h
            </div>
            <div className="text-xs text-gray-400">Time Spent</div>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 border border-red-500/20 bg-red-900/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="AlertTriangle" className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-red-200 font-medium">Reset Profile</h4>
                <p className="text-red-300 text-sm mt-1">
                  Reset all profile settings to default values
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-600/20 text-red-200 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Reset Profile
              </motion.button>
            </div>
          </div>

          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-red-200 font-medium">Delete Account</h4>
                <p className="text-red-300 text-sm mt-1">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;