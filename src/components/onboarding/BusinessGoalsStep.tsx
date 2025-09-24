import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, DollarSign, Users, TrendingUp, CheckSquare } from 'lucide-react';
import { OnboardingStepProps, INDUSTRY_TEMPLATES } from '../../types/onboarding';

const BUSINESS_GOALS = [
  { id: 'lead-generation', label: 'Lead Generation', description: 'Generate qualified leads for sales team' },
  { id: 'brand-awareness', label: 'Brand Awareness', description: 'Increase brand recognition and visibility' },
  { id: 'website-traffic', label: 'Website Traffic', description: 'Drive more visitors to website' },
  { id: 'sales-increase', label: 'Sales Increase', description: 'Boost revenue and conversion rates' },
  { id: 'customer-retention', label: 'Customer Retention', description: 'Improve customer loyalty and repeat business' },
  { id: 'market-expansion', label: 'Market Expansion', description: 'Enter new markets or demographics' },
  { id: 'seo-improvement', label: 'SEO Rankings', description: 'Improve search engine rankings' },
  { id: 'social-engagement', label: 'Social Media Engagement', description: 'Increase social media following and interaction' },
  { id: 'thought-leadership', label: 'Thought Leadership', description: 'Establish industry expertise and authority' },
  { id: 'cost-reduction', label: 'Marketing Cost Reduction', description: 'Optimize marketing spend efficiency' }
];

const KEY_METRICS = [
  { id: 'revenue', label: 'Revenue Growth', description: 'Monthly/yearly revenue increase' },
  { id: 'leads', label: 'Lead Volume', description: 'Number of qualified leads generated' },
  { id: 'traffic', label: 'Website Traffic', description: 'Unique visitors and page views' },
  { id: 'conversion', label: 'Conversion Rate', description: 'Percentage of visitors who convert' },
  { id: 'customer-acquisition', label: 'Customer Acquisition Cost', description: 'Cost to acquire new customers' },
  { id: 'roi', label: 'Marketing ROI', description: 'Return on marketing investment' },
  { id: 'engagement', label: 'Engagement Rate', description: 'Social media and content engagement' },
  { id: 'retention', label: 'Customer Retention', description: 'Customer lifetime value and retention' },
  { id: 'rankings', label: 'SEO Rankings', description: 'Search engine ranking positions' },
  { id: 'brand-mentions', label: 'Brand Mentions', description: 'Online brand visibility and mentions' }
];

const CURRENT_CHALLENGES = [
  'Low website traffic',
  'Poor conversion rates',
  'High customer acquisition costs',
  'Lack of brand awareness',
  'Inconsistent lead quality',
  'Poor social media engagement',
  'Low search engine rankings',
  'Limited market reach',
  'High bounce rates',
  'Difficulty tracking ROI',
  'Ineffective content strategy',
  'Competition from larger brands'
];

const BUDGET_RANGES = [
  { value: 1000, label: '$1,000 - $2,500', description: 'Small business budget' },
  { value: 2500, label: '$2,500 - $5,000', description: 'Growing business budget' },
  { value: 5000, label: '$5,000 - $10,000', description: 'Established business budget' },
  { value: 10000, label: '$10,000 - $25,000', description: 'Enterprise budget' },
  { value: 25000, label: '$25,000+', description: 'Large enterprise budget' }
];

const BusinessGoalsStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  errors
}) => {
  const [localData, setLocalData] = useState({
    primaryGoals: formData.businessGoals?.primaryGoals || [],
    monthlyBudget: formData.businessGoals?.monthlyBudget || 0,
    targetAudience: formData.businessGoals?.targetAudience || '',
    keyMetrics: formData.businessGoals?.keyMetrics || [],
    currentChallenges: formData.businessGoals?.currentChallenges || []
  });

  const [customBudget, setCustomBudget] = useState(
    localData.monthlyBudget > 0 &&
    !BUDGET_RANGES.some(range => range.value === localData.monthlyBudget)
  );

  // Get industry template suggestions
  const selectedIndustry = formData.basicInfo?.industry;
  const industryTemplate = INDUSTRY_TEMPLATES.find(template => template.name === selectedIndustry);

  // Update parent when local data changes
  useEffect(() => {
    onUpdate('businessGoals', localData);
  }, [localData, onUpdate]);

  const handleGoalToggle = (goalId: string) => {
    setLocalData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goalId)
        ? prev.primaryGoals.filter(id => id !== goalId)
        : [...prev.primaryGoals, goalId]
    }));
  };

  const handleMetricToggle = (metricId: string) => {
    setLocalData(prev => ({
      ...prev,
      keyMetrics: prev.keyMetrics.includes(metricId)
        ? prev.keyMetrics.filter(id => id !== metricId)
        : [...prev.keyMetrics, metricId]
    }));
  };

  const handleChallengeToggle = (challenge: string) => {
    setLocalData(prev => ({
      ...prev,
      currentChallenges: prev.currentChallenges.includes(challenge)
        ? prev.currentChallenges.filter(c => c !== challenge)
        : [...prev.currentChallenges, challenge]
    }));
  };

  const handleBudgetSelect = (amount: number) => {
    setLocalData(prev => ({ ...prev, monthlyBudget: amount }));
    setCustomBudget(false);
  };

  const handleCustomBudgetChange = (amount: number) => {
    setLocalData(prev => ({ ...prev, monthlyBudget: amount }));
  };

  const loadIndustryDefaults = () => {
    if (industryTemplate) {
      const defaultGoalIds = industryTemplate.defaultGoals.map(goal =>
        BUSINESS_GOALS.find(bg => bg.label === goal)?.id
      ).filter(Boolean) as string[];

      setLocalData(prev => ({
        ...prev,
        primaryGoals: [...new Set([...prev.primaryGoals, ...defaultGoalIds])],
        monthlyBudget: prev.monthlyBudget || industryTemplate.typicalBudgetRange.min
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Industry Suggestions */}
      {industryTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-purple-600/10 border border-purple-500/30 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>{industryTemplate.name} Industry Suggestions</span>
            </h4>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadIndustryDefaults}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply Suggestions
            </motion.button>
          </div>
          <div className="space-y-2 text-sm text-purple-200">
            <p><strong>Common Goals:</strong> {industryTemplate.defaultGoals.join(', ')}</p>
            <p><strong>Typical Budget:</strong> ${industryTemplate.typicalBudgetRange.min.toLocaleString()} - ${industryTemplate.typicalBudgetRange.max.toLocaleString()}/month</p>
          </div>
        </motion.div>
      )}

      {/* Primary Business Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-green-400" />
          <span>Primary Business Goals *</span>
        </h4>
        <p className="text-gray-400 mb-6">Select all that apply (minimum 1 required)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESS_GOALS.map((goal) => (
            <motion.div
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-4 rounded-xl cursor-pointer transition-all duration-200 border
                ${localData.primaryGoals.includes(goal.id)
                  ? 'bg-green-600/20 border-green-400 text-white'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 text-gray-300'
                }
              `}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${localData.primaryGoals.includes(goal.id)
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500'
                  }
                `}>
                  {localData.primaryGoals.includes(goal.id) && (
                    <CheckSquare className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <h5 className="font-medium">{goal.label}</h5>
                  <p className="text-sm opacity-80 mt-1">{goal.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Monthly Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-blue-400" />
          <span>Monthly Marketing Budget *</span>
        </h4>
        <p className="text-gray-400 mb-6">Select your approximate monthly marketing budget</p>

        <div className="space-y-3 mb-6">
          {BUDGET_RANGES.map((range) => (
            <motion.label
              key={range.value}
              whileHover={{ scale: 1.01 }}
              className={`
                flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border
                ${localData.monthlyBudget === range.value && !customBudget
                  ? 'bg-blue-600/20 border-blue-400 text-white'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 text-gray-300'
                }
              `}
            >
              <input
                type="radio"
                name="budget"
                checked={localData.monthlyBudget === range.value && !customBudget}
                onChange={() => handleBudgetSelect(range.value)}
                className="sr-only"
              />
              <DollarSign className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium">{range.label}</div>
                <div className="text-sm opacity-80">{range.description}</div>
              </div>
            </motion.label>
          ))}

          {/* Custom Budget Option */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`
              flex items-center p-4 rounded-lg border transition-all duration-200
              ${customBudget
                ? 'bg-blue-600/20 border-blue-400'
                : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
              }
            `}
          >
            <label className="flex items-center flex-1 cursor-pointer">
              <input
                type="radio"
                name="budget"
                checked={customBudget}
                onChange={() => setCustomBudget(true)}
                className="sr-only"
              />
              <DollarSign className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-white">Custom Amount</div>
                <div className="text-sm text-gray-400">Enter your specific budget</div>
              </div>
            </label>
            {customBudget && (
              <div className="ml-4">
                <input
                  type="number"
                  value={localData.monthlyBudget || ''}
                  onChange={(e) => handleCustomBudgetChange(parseInt(e.target.value) || 0)}
                  placeholder="5000"
                  className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-right focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Target Audience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span>Target Audience Description</span>
        </h4>
        <p className="text-gray-400 mb-4">Describe your ideal customer or target market</p>

        <textarea
          value={localData.targetAudience}
          onChange={(e) => setLocalData(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="e.g., Small business owners aged 30-50 looking for digital marketing solutions, primarily in the B2B sector with 10-100 employees..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
        />
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <span>Key Performance Metrics</span>
        </h4>
        <p className="text-gray-400 mb-6">Which metrics matter most to your business?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {KEY_METRICS.map((metric) => (
            <motion.div
              key={metric.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200 border
                ${localData.keyMetrics.includes(metric.id)
                  ? 'bg-orange-600/20 border-orange-400 text-white'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 text-gray-300'
                }
              `}
              onClick={() => handleMetricToggle(metric.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5
                  ${localData.keyMetrics.includes(metric.id)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-500'
                  }
                `}>
                  {localData.keyMetrics.includes(metric.id) && (
                    <CheckSquare className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <div>
                  <h6 className="font-medium text-sm">{metric.label}</h6>
                  <p className="text-xs opacity-80 mt-0.5">{metric.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Current Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-red-400" />
          <span>Current Marketing Challenges</span>
        </h4>
        <p className="text-gray-400 mb-6">What challenges are you facing? (Select all that apply)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CURRENT_CHALLENGES.map((challenge) => (
            <motion.div
              key={challenge}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200 border
                ${localData.currentChallenges.includes(challenge)
                  ? 'bg-red-600/20 border-red-400 text-white'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 text-gray-300'
                }
              `}
              onClick={() => handleChallengeToggle(challenge)}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                  ${localData.currentChallenges.includes(challenge)
                    ? 'bg-red-500 border-red-500'
                    : 'border-gray-500'
                  }
                `}>
                  {localData.currentChallenges.includes(challenge) && (
                    <CheckSquare className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">{challenge}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Summary */}
      {(localData.primaryGoals.length > 0 || localData.monthlyBudget > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gray-700/30 rounded-xl border border-gray-600"
        >
          <h4 className="text-lg font-semibold text-white mb-3">Business Goals Summary</h4>
          <div className="space-y-2 text-gray-300 text-sm">
            <p><strong>Goals:</strong> {localData.primaryGoals.map(id => BUSINESS_GOALS.find(g => g.id === id)?.label).join(', ')}</p>
            <p><strong>Budget:</strong> ${localData.monthlyBudget?.toLocaleString()}/month</p>
            <p><strong>Key Metrics:</strong> {localData.keyMetrics.map(id => KEY_METRICS.find(m => m.id === id)?.label).join(', ')}</p>
            {localData.currentChallenges.length > 0 && (
              <p><strong>Challenges:</strong> {localData.currentChallenges.length} identified</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BusinessGoalsStep;