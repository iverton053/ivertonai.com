import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Target, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const ADVERTISING_PLATFORMS = [
  { key: 'googleAds', name: 'Google Ads', description: 'Search, Display, Shopping, YouTube ads' },
  { key: 'facebookAds', name: 'Facebook Ads', description: 'Facebook and Instagram advertising' },
  { key: 'linkedinAds', name: 'LinkedIn Ads', description: 'Professional B2B advertising' },
  { key: 'twitterAds', name: 'Twitter Ads', description: 'Twitter/X advertising platform' },
  { key: 'tiktokAds', name: 'TikTok Ads', description: 'TikTok for Business advertising' },
  { key: 'bingAds', name: 'Microsoft Ads', description: 'Bing search advertising' }
];

const CAMPAIGN_TYPES = [
  'Search Campaigns',
  'Display Campaigns',
  'Shopping Campaigns',
  'Video Campaigns',
  'Social Media Campaigns',
  'Retargeting Campaigns',
  'Lead Generation',
  'Brand Awareness',
  'Local Campaigns'
];

const BUDGET_RANGES = [
  { value: '500-1000', label: '$500 - $1,000/month' },
  { value: '1000-2500', label: '$1,000 - $2,500/month' },
  { value: '2500-5000', label: '$2,500 - $5,000/month' },
  { value: '5000-10000', label: '$5,000 - $10,000/month' },
  { value: '10000-25000', label: '$10,000 - $25,000/month' },
  { value: '25000+', label: '$25,000+/month' }
];

const AdvertisingStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    totalMonthlyBudget: '',
    platforms: {
      googleAds: { enabled: false, accountId: '', monthlyBudget: '', accessToken: '' },
      facebookAds: { enabled: false, accountId: '', monthlyBudget: '', accessToken: '' },
      linkedinAds: { enabled: false, accountId: '', monthlyBudget: '', accessToken: '' },
      twitterAds: { enabled: false, accountId: '', monthlyBudget: '', accessToken: '' },
      tiktokAds: { enabled: false, accountId: '', monthlyBudget: '', accessToken: '' },
      bingAds: { enabled: false, accountId: '', monthlyBudget: '', accessToken: '' }
    },
    campaignTypes: [],
    targetAudience: {
      ageRange: { min: 18, max: 65 },
      genders: [],
      interests: '',
      locations: '',
      behaviors: ''
    },
    currentProvider: '',
    kpis: [],
    conversionGoals: '',
    seasonalFactors: '',
    competitorAnalysis: '',
    ...formData.advertising
  });

  const [showTokens, setShowTokens] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    onUpdate('advertising', localData);
  }, [localData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setLocalData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setLocalData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePlatformToggle = (platform: string, enabled: boolean) => {
    setLocalData(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: {
          ...prev.platforms[platform as keyof typeof prev.platforms],
          enabled
        }
      }
    }));
  };

  const handlePlatformChange = (platform: string, field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: {
          ...prev.platforms[platform as keyof typeof prev.platforms],
          [field]: value
        }
      }
    }));
  };

  const toggleTokenVisibility = (platform: string) => {
    setShowTokens(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    const currentArray = localData[field as keyof typeof localData] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const PROVIDERS = [
    'None - Managing In-House',
    'Google Ads Agency',
    'Facebook Marketing Partner',
    'Full-Service Digital Agency',
    'Freelancer',
    'Other'
  ];

  const KPI_OPTIONS = [
    'Cost Per Acquisition (CPA)',
    'Return on Ad Spend (ROAS)',
    'Click-Through Rate (CTR)',
    'Conversion Rate',
    'Cost Per Click (CPC)',
    'Impressions',
    'Reach',
    'Lead Quality Score'
  ];

  const GENDERS = ['Male', 'Female', 'Non-binary', 'All'];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Advertising Setup</h3>
        <p className="text-gray-400 mb-6">
          Configure advertising platforms, budgets, and targeting preferences
        </p>
      </motion.div>

      {/* Total Budget */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Total Monthly Advertising Budget
        </label>
        <select
          value={localData.totalMonthlyBudget}
          onChange={(e) => handleInputChange('totalMonthlyBudget', e.target.value)}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">Select Budget Range</option>
          {BUDGET_RANGES.map(budget => (
            <option key={budget.value} value={budget.value}>
              {budget.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advertising Platforms */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Advertising Platforms</h4>
        <div className="space-y-4">
          {ADVERTISING_PLATFORMS.map((platform) => (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                localData.platforms[platform.key as keyof typeof localData.platforms]?.enabled
                  ? 'bg-purple-600/10 border-purple-400/30'
                  : 'bg-gray-700/30 border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      checked={localData.platforms[platform.key as keyof typeof localData.platforms]?.enabled || false}
                      onChange={(e) => handlePlatformToggle(platform.key, e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <h5 className="font-medium text-white">{platform.name}</h5>
                  </div>
                  <p className="text-sm text-gray-400">{platform.description}</p>
                </div>
              </div>

              {localData.platforms[platform.key as keyof typeof localData.platforms]?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <input
                      type="text"
                      value={localData.platforms[platform.key as keyof typeof localData.platforms]?.accountId || ''}
                      onChange={(e) => handlePlatformChange(platform.key, 'accountId', e.target.value)}
                      placeholder="Account ID"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={localData.platforms[platform.key as keyof typeof localData.platforms]?.monthlyBudget || ''}
                      onChange={(e) => handlePlatformChange(platform.key, 'monthlyBudget', e.target.value)}
                      placeholder="Monthly Budget ($)"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="relative">
                      <input
                        type={showTokens[platform.key] ? "text" : "password"}
                        value={localData.platforms[platform.key as keyof typeof localData.platforms]?.accessToken || ''}
                        onChange={(e) => handlePlatformChange(platform.key, 'accessToken', e.target.value)}
                        placeholder="API Access Token (optional)"
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
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Campaign Types */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Campaign Types (select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CAMPAIGN_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.campaignTypes.includes(type)}
                onChange={() => handleArrayToggle('campaignTypes', type)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-white">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Target Audience</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Age Range</label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={localData.targetAudience.ageRange.min}
                onChange={(e) => handleInputChange('targetAudience.ageRange.min', parseInt(e.target.value))}
                min="13"
                max="99"
                className="w-20 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                value={localData.targetAudience.ageRange.max}
                onChange={(e) => handleInputChange('targetAudience.ageRange.max', parseInt(e.target.value))}
                min="13"
                max="99"
                className="w-20 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Gender Targeting</label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map(gender => (
                <label key={gender} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localData.targetAudience.genders.includes(gender)}
                    onChange={() => {
                      const genders = localData.targetAudience.genders.includes(gender)
                        ? localData.targetAudience.genders.filter(g => g !== gender)
                        : [...localData.targetAudience.genders, gender];
                      handleInputChange('targetAudience.genders', genders);
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-white">{gender}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Interests & Hobbies</label>
            <textarea
              value={localData.targetAudience.interests}
              onChange={(e) => handleInputChange('targetAudience.interests', e.target.value)}
              placeholder="Technology, fitness, cooking, travel..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Geographic Locations</label>
            <textarea
              value={localData.targetAudience.locations}
              onChange={(e) => handleInputChange('targetAudience.locations', e.target.value)}
              placeholder="United States, New York, San Francisco..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Key Performance Indicators (KPIs)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {KPI_OPTIONS.map((kpi) => (
            <label
              key={kpi}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.kpis.includes(kpi)}
                onChange={() => handleArrayToggle('kpis', kpi)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-white">{kpi}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Current Provider */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Current Advertising Provider/Agency
        </label>
        <select
          value={localData.currentProvider}
          onChange={(e) => handleInputChange('currentProvider', e.target.value)}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">Select Current Setup</option>
          {PROVIDERS.map(provider => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
      >
        Continue to Technical Integration
      </motion.button>
    </div>
  );
};

export default AdvertisingStep;