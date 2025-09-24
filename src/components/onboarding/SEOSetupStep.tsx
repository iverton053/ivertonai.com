import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Key } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const SEOSetupStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    targetKeywords: formData.seoData?.targetKeywords || [],
    competitors: formData.seoData?.competitors || [],
    googleAnalyticsId: formData.seoData?.googleAnalyticsId || '',
    googleSearchConsoleConnected: formData.seoData?.googleSearchConsoleConnected || false,
    existingContent: formData.seoData?.existingContent || [],
    currentSEOProvider: formData.seoData?.currentSEOProvider || ''
  });

  useEffect(() => {
    onUpdate('seoData', localData);
  }, [localData, onUpdate]);

  const handleKeywordChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setLocalData(prev => ({ ...prev, targetKeywords: keywords }));
  };

  const handleCompetitorChange = (value: string) => {
    const competitors = value.split(',').map(c => c.trim()).filter(c => c.length > 0);
    setLocalData(prev => ({ ...prev, competitors }));
  };

  const handleInputChange = (field: string, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const SEO_PROVIDERS = [
    'None',
    'SEMrush',
    'Ahrefs',
    'Moz',
    'BrightEdge',
    'Screaming Frog',
    'Google Search Console',
    'Other'
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">SEO & Content Setup</h3>
        <p className="text-gray-400 mb-6">
          Configure SEO tracking and content strategy for your client
        </p>
      </motion.div>

      {/* Target Keywords */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Target Keywords
        </label>
        <textarea
          value={localData.targetKeywords.join(', ')}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="digital marketing, SEO services, web design, content marketing..."
          rows={3}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
        <p className="text-sm text-gray-400 mt-1">Separate keywords with commas</p>
      </div>

      {/* Competitors */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Main Competitors
        </label>
        <textarea
          value={localData.competitors.join(', ')}
          onChange={(e) => handleCompetitorChange(e.target.value)}
          placeholder="competitor1.com, competitor2.com, competitor3.com..."
          rows={2}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
        <p className="text-sm text-gray-400 mt-1">Enter competitor websites or company names</p>
      </div>

      {/* Analytics Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={localData.googleAnalyticsId}
            onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
            placeholder="GA4-XXXXXXXXX or UA-XXXXXXXX-X"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Current SEO Provider
          </label>
          <select
            value={localData.currentSEOProvider}
            onChange={(e) => handleInputChange('currentSEOProvider', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select Provider</option>
            {SEO_PROVIDERS.map(provider => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Google Search Console */}
      <div>
        <label className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.googleSearchConsoleConnected}
            onChange={(e) => handleInputChange('googleSearchConsoleConnected', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="text-white font-medium">Google Search Console Connected</span>
            <p className="text-sm text-gray-400">Website is verified in Google Search Console</p>
          </div>
        </label>
      </div>

      {/* Existing Content */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Existing Content Notes
        </label>
        <textarea
          value={localData.existingContent.join('\n')}
          onChange={(e) => {
            const content = e.target.value.split('\n').filter(line => line.trim());
            handleInputChange('existingContent', content);
          }}
          placeholder="Blog posts, landing pages, product descriptions, case studies..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
        <p className="text-sm text-gray-400 mt-1">Describe existing content and content strategy</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
      >
        Continue to Social Media
      </motion.button>
    </div>
  );
};

export default SEOSetupStep;