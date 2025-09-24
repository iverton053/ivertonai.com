import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Zap, Users, ArrowRight } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const EMAIL_PROVIDERS = [
  'None',
  'Mailchimp',
  'ActiveCampaign',
  'HubSpot',
  'ConvertKit',
  'Constant Contact',
  'GetResponse',
  'AWeber',
  'Campaign Monitor',
  'Other'
];

const CRM_SYSTEMS = [
  'None',
  'HubSpot',
  'Salesforce',
  'Pipedrive',
  'ActiveCampaign',
  'Zoho CRM',
  'Monday.com',
  'Airtable',
  'Other'
];

const AUTOMATION_TYPES = [
  'Welcome Email Series',
  'Abandoned Cart Recovery',
  'Lead Nurturing',
  'Customer Onboarding',
  'Re-engagement Campaigns',
  'Birthday/Anniversary Emails',
  'Product Recommendations',
  'Survey Follow-ups'
];

const LEAD_SOURCES = [
  'Website Forms',
  'Social Media',
  'Paid Advertising',
  'Referrals',
  'Events/Webinars',
  'Content Downloads',
  'Direct Sales',
  'Partners'
];

const MarketingAutomationStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    emailProvider: '',
    emailListSize: '',
    crmSystem: '',
    automationTypes: [],
    leadSources: [],
    currentWorkflows: [],
    marketingGoals: '',
    pipelineStages: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    leadScoringCriteria: '',
    ...formData.marketing
  });

  useEffect(() => {
    onUpdate('marketing', localData);
  }, [localData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
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

  const addPipelineStage = () => {
    const newStage = prompt('Enter new pipeline stage:');
    if (newStage && !localData.pipelineStages.includes(newStage)) {
      handleInputChange('pipelineStages', [...localData.pipelineStages, newStage]);
    }
  };

  const removePipelineStage = (stageToRemove: string) => {
    handleInputChange('pipelineStages', localData.pipelineStages.filter(stage => stage !== stageToRemove));
  };

  const EMAIL_LIST_SIZES = [
    { value: '0-500', label: '0 - 500 subscribers' },
    { value: '501-2000', label: '501 - 2,000 subscribers' },
    { value: '2001-10000', label: '2,001 - 10,000 subscribers' },
    { value: '10001-50000', label: '10,001 - 50,000 subscribers' },
    { value: '50000+', label: '50,000+ subscribers' }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Mail className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Marketing Automation Setup</h3>
        <p className="text-gray-400 mb-6">
          Configure email marketing, CRM, and automation workflows
        </p>
      </motion.div>

      {/* Current Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email Marketing Provider
          </label>
          <select
            value={localData.emailProvider}
            onChange={(e) => handleInputChange('emailProvider', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select Provider</option>
            {EMAIL_PROVIDERS.map(provider => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email List Size
          </label>
          <select
            value={localData.emailListSize}
            onChange={(e) => handleInputChange('emailListSize', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select List Size</option>
            {EMAIL_LIST_SIZES.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          CRM System
        </label>
        <select
          value={localData.crmSystem}
          onChange={(e) => handleInputChange('crmSystem', e.target.value)}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="">Select CRM</option>
          {CRM_SYSTEMS.map(crm => (
            <option key={crm} value={crm}>
              {crm}
            </option>
          ))}
        </select>
      </div>

      {/* Automation Types */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Automation Types Needed (select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AUTOMATION_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.automationTypes.includes(type)}
                onChange={() => handleArrayToggle('automationTypes', type)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-white">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Lead Sources */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Primary Lead Sources (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LEAD_SOURCES.map((source) => (
            <label
              key={source}
              className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.leadSources.includes(source)}
                onChange={() => handleArrayToggle('leadSources', source)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-white">{source}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sales Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-white">
            Sales Pipeline Stages
          </label>
          <button
            onClick={addPipelineStage}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            + Add Stage
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localData.pipelineStages.map((stage, index) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 bg-purple-600/20 border border-purple-400/30 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-white">{stage}</span>
              {index > 0 && (
                <button
                  onClick={() => removePipelineStage(stage)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ×
                </button>
              )}
              {index < localData.pipelineStages.length - 1 && (
                <ArrowRight className="w-3 h-3 text-gray-400" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marketing Goals */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Marketing Goals & Objectives
        </label>
        <textarea
          value={localData.marketingGoals}
          onChange={(e) => handleInputChange('marketingGoals', e.target.value)}
          placeholder="Describe your primary marketing goals and what success looks like..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {/* Lead Scoring */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Lead Scoring Criteria (optional)
        </label>
        <textarea
          value={localData.leadScoringCriteria}
          onChange={(e) => handleInputChange('leadScoringCriteria', e.target.value)}
          placeholder="Describe how you score leads (e.g., email opens +5, website visits +10, demo requests +25)..."
          rows={3}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
      >
        Continue to Advertising
      </motion.button>
    </div>
  );
};

export default MarketingAutomationStep;