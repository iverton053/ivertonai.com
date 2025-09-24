import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Database, Shield, Code, Link } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const WEBSITE_PLATFORMS = [
  'WordPress',
  'Shopify',
  'Wix',
  'Squarespace',
  'Custom HTML/CSS',
  'React/Next.js',
  'Angular',
  'Vue.js',
  'Webflow',
  'Other'
];

const HOSTING_PROVIDERS = [
  'GoDaddy',
  'Bluehost',
  'SiteGround',
  'HostGator',
  'AWS',
  'Google Cloud',
  'Vercel',
  'Netlify',
  'Digital Ocean',
  'Other'
];

const ANALYTICS_TOOLS = [
  'Google Analytics',
  'Google Tag Manager',
  'Facebook Pixel',
  'LinkedIn Insight Tag',
  'Hotjar',
  'Mixpanel',
  'Adobe Analytics',
  'Klaviyo',
  'Other'
];

const INTEGRATION_NEEDS = [
  'CRM Integration',
  'Email Marketing Platform',
  'Social Media Scheduling',
  'E-commerce Platform',
  'Payment Processing',
  'Appointment Booking',
  'Live Chat',
  'Help Desk',
  'Inventory Management',
  'Accounting Software'
];

const TechnicalIntegrationStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    websitePlatform: '',
    hostingProvider: '',
    domainRegistrar: '',
    hasSSL: false,
    currentAnalytics: [],
    integrationNeeds: [],
    apiAccess: {
      hasWebsiteAccess: false,
      hasFTPAccess: false,
      hasAdminAccess: false,
      hasGoogleAnalyticsAccess: false,
      hasGoogleAdsAccess: false,
      hasFacebookBusinessAccess: false
    },
    technicalRequirements: '',
    currentIntegrations: '',
    dataPrivacyCompliance: [],
    backupFrequency: '',
    securityMeasures: [],
    ...formData.technical
  });

  useEffect(() => {
    onUpdate('technical', localData);
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

  const handleArrayToggle = (field: string, value: string) => {
    const currentArray = localData[field as keyof typeof localData] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const BACKUP_FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'none', label: 'No Regular Backups' },
    { value: 'unknown', label: 'Unknown' }
  ];

  const PRIVACY_COMPLIANCE = [
    'GDPR (EU)',
    'CCPA (California)',
    'PIPEDA (Canada)',
    'LGPD (Brazil)',
    'None Specifically',
    'Not Sure'
  ];

  const SECURITY_MEASURES = [
    'SSL Certificate',
    'Two-Factor Authentication',
    'Regular Security Updates',
    'Firewall Protection',
    'Malware Scanning',
    'DDoS Protection',
    'Regular Security Audits',
    'Backup & Recovery Plan'
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Technical Integration</h3>
        <p className="text-gray-400 mb-6">
          Configure website platform, hosting, and technical requirements
        </p>
      </motion.div>

      {/* Website Platform & Hosting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2 flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Website Platform</span>
          </label>
          <select
            value={localData.websitePlatform}
            onChange={(e) => handleInputChange('websitePlatform', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select Platform</option>
            {WEBSITE_PLATFORMS.map(platform => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2 flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Hosting Provider</span>
          </label>
          <select
            value={localData.hostingProvider}
            onChange={(e) => handleInputChange('hostingProvider', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select Hosting Provider</option>
            {HOSTING_PROVIDERS.map(provider => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Domain Registrar
          </label>
          <input
            type="text"
            value={localData.domainRegistrar}
            onChange={(e) => handleInputChange('domainRegistrar', e.target.value)}
            placeholder="GoDaddy, Namecheap, etc."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Backup Frequency
          </label>
          <select
            value={localData.backupFrequency}
            onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select Backup Frequency</option>
            {BACKUP_FREQUENCIES.map(freq => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SSL Certificate */}
      <div>
        <label className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.hasSSL}
            onChange={(e) => handleInputChange('hasSSL', e.target.checked)}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
          <Shield className="w-5 h-5 text-green-400" />
          <div>
            <span className="text-white font-medium">SSL Certificate Installed</span>
            <p className="text-sm text-gray-400">Website has HTTPS enabled</p>
          </div>
        </label>
      </div>

      {/* Current Analytics Tools */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Current Analytics & Tracking Tools (select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ANALYTICS_TOOLS.map((tool) => (
            <label
              key={tool}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.currentAnalytics.includes(tool)}
                onChange={() => handleArrayToggle('currentAnalytics', tool)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-white">{tool}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Integration Needs */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Integration Needs (select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTEGRATION_NEEDS.map((need) => (
            <label
              key={need}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.integrationNeeds.includes(need)}
                onChange={() => handleArrayToggle('integrationNeeds', need)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <Link className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">{need}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Access Permissions */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Code className="w-5 h-5" />
          <span>Access Permissions</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'hasWebsiteAccess', label: 'Website Admin Access', description: 'Full admin access to website' },
            { key: 'hasFTPAccess', label: 'FTP/SFTP Access', description: 'File transfer protocol access' },
            { key: 'hasAdminAccess', label: 'Hosting Admin Access', description: 'Control panel access' },
            { key: 'hasGoogleAnalyticsAccess', label: 'Google Analytics Access', description: 'Analytics dashboard access' },
            { key: 'hasGoogleAdsAccess', label: 'Google Ads Access', description: 'Ads management access' },
            { key: 'hasFacebookBusinessAccess', label: 'Facebook Business Access', description: 'Business Manager access' }
          ].map((access) => (
            <label
              key={access.key}
              className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.apiAccess[access.key as keyof typeof localData.apiAccess]}
                onChange={(e) => handleInputChange(`apiAccess.${access.key}`, e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 mt-1"
              />
              <div>
                <span className="text-white font-medium">{access.label}</span>
                <p className="text-sm text-gray-400">{access.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security Measures */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Current Security Measures (select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECURITY_MEASURES.map((measure) => (
            <label
              key={measure}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.securityMeasures.includes(measure)}
                onChange={() => handleArrayToggle('securityMeasures', measure)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">{measure}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Compliance */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Data Privacy Compliance Requirements
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRIVACY_COMPLIANCE.map((compliance) => (
            <label
              key={compliance}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.dataPrivacyCompliance.includes(compliance)}
                onChange={() => handleArrayToggle('dataPrivacyCompliance', compliance)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-white">{compliance}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Technical Requirements */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Additional Technical Requirements or Notes
        </label>
        <textarea
          value={localData.technicalRequirements}
          onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
          placeholder="Any specific technical requirements, custom integrations, or special considerations..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
      >
        Continue to Reporting
      </motion.button>
    </div>
  );
};

export default TechnicalIntegrationStep;