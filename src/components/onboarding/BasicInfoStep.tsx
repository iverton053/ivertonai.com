import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Globe, MapPin, Users } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';
import { INDUSTRY_TEMPLATES } from '../../types/onboarding';

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)', description: 'Early-stage company' },
  { value: 'small', label: 'Small (11-50 employees)', description: 'Small business' },
  { value: 'medium', label: 'Medium (51-200 employees)', description: 'Growing company' },
  { value: 'large', label: 'Large (201-1000 employees)', description: 'Established enterprise' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)', description: 'Large corporation' }
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney'
];

const BasicInfoStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext,
  errors
}) => {
  const [localData, setLocalData] = useState({
    clientName: formData.basicInfo?.clientName || '',
    company: formData.basicInfo?.company || '',
    industry: formData.basicInfo?.industry || '',
    companySize: formData.basicInfo?.companySize || 'small',
    website: formData.basicInfo?.website || '',
    businessLocation: {
      city: formData.basicInfo?.businessLocation?.city || '',
      state: formData.basicInfo?.businessLocation?.state || '',
      country: formData.basicInfo?.businessLocation?.country || 'United States',
      timezone: formData.basicInfo?.businessLocation?.timezone || 'America/New_York'
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Update parent when local data changes
  useEffect(() => {
    onUpdate('basicInfo', localData);
  }, [localData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLocalData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = INDUSTRY_TEMPLATES.find(t => t.id === templateId);

    if (template) {
      setLocalData(prev => ({
        ...prev,
        industry: template.name
      }));
    }
  };

  const formatWebsiteUrl = (url: string): string => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleWebsiteChange = (value: string) => {
    const formatted = formatWebsiteUrl(value);
    handleInputChange('website', formatted);
  };

  return (
    <div className="space-y-8">
      {/* Industry Templates Quick Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Building className="w-5 h-5" />
          <span>Quick Setup by Industry</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRY_TEMPLATES.map((template) => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTemplateSelect(template.id)}
              className={`
                p-4 rounded-xl text-left transition-all duration-200 border
                ${selectedTemplate === template.id
                  ? 'bg-purple-600/20 border-purple-400 text-white'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                }
              `}
            >
              <h5 className="font-medium mb-1">{template.name}</h5>
              <p className="text-sm opacity-80">{template.description}</p>
              <div className="mt-2 text-xs opacity-60">
                Budget: ${template.typicalBudgetRange.min.toLocaleString()} - ${template.typicalBudgetRange.max.toLocaleString()}/mo
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Client Name *
            </label>
            <input
              type="text"
              value={localData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={localData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="TechCorp Solutions"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Industry *
            </label>
            <select
              value={localData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select Industry</option>
              {INDUSTRY_TEMPLATES.map(template => (
                <option key={template.id} value={template.name}>
                  {template.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Website URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={localData.website}
                onChange={(e) => handleWebsiteChange(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company Size *
            </label>
            <div className="space-y-3">
              {COMPANY_SIZES.map((size) => (
                <motion.label
                  key={size.value}
                  whileHover={{ scale: 1.01 }}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border
                    ${localData.companySize === size.value
                      ? 'bg-purple-600/20 border-purple-400'
                      : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="companySize"
                    value={size.value}
                    checked={localData.companySize === size.value}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="sr-only"
                  />
                  <Users className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">{size.label}</div>
                    <div className="text-sm text-gray-400">{size.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-8 border-t border-gray-700"
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Business Location</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              City
            </label>
            <input
              type="text"
              value={localData.businessLocation.city}
              onChange={(e) => handleInputChange('businessLocation.city', e.target.value)}
              placeholder="New York"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              State
            </label>
            <input
              type="text"
              value={localData.businessLocation.state}
              onChange={(e) => handleInputChange('businessLocation.state', e.target.value)}
              placeholder="NY"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Country
            </label>
            <select
              value={localData.businessLocation.country}
              onChange={(e) => handleInputChange('businessLocation.country', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Timezone
            </label>
            <select
              value={localData.businessLocation.timezone}
              onChange={(e) => handleInputChange('businessLocation.timezone', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ').replace('/', ' / ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Quick Preview */}
      {(localData.clientName || localData.company) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gray-700/30 rounded-xl border border-gray-600"
        >
          <h4 className="text-lg font-semibold text-white mb-3">Preview</h4>
          <div className="text-gray-300">
            <p><strong>Client:</strong> {localData.clientName}</p>
            <p><strong>Company:</strong> {localData.company}</p>
            <p><strong>Industry:</strong> {localData.industry}</p>
            <p><strong>Website:</strong> {localData.website}</p>
            <p><strong>Location:</strong> {localData.businessLocation.city}, {localData.businessLocation.state}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BasicInfoStep;