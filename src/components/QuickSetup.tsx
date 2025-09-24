import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  Building, 
  Target, 
  Hash, 
  Users, 
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useAutomationHubStore } from '../stores/automationHubStore';

interface QuickSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickSetup: React.FC<QuickSetupProps> = ({ isOpen, onClose }) => {
  const { userProfile, setUserProfile, completeSetup } = useAutomationHubStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    defaultDomain: userProfile.defaultDomain || '',
    companyName: userProfile.companyName || '',
    industry: userProfile.industry || '',
    competitors: userProfile.competitors || [],
    keywords: userProfile.keywords || [],
    socialAccounts: userProfile.socialAccounts || []
  });
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSocialAccount, setNewSocialAccount] = useState({ platform: '', handle: '' });

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us about your business',
      icon: Building
    },
    {
      id: 'competitors',
      title: 'Competitors',
      description: 'Who are your main competitors?',
      icon: Target
    },
    {
      id: 'keywords',
      title: 'Keywords',
      description: 'What keywords do you want to track?',
      icon: Hash
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Connect your social accounts',
      icon: Users
    }
  ];

  const industries = [
    'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education', 
    'Real Estate', 'Marketing', 'Consulting', 'Manufacturing', 'Other'
  ];

  const socialPlatforms = [
    'Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'TikTok'
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        defaultDomain: userProfile.defaultDomain || '',
        companyName: userProfile.companyName || '',
        industry: userProfile.industry || '',
        competitors: userProfile.competitors || [],
        keywords: userProfile.keywords || [],
        socialAccounts: userProfile.socialAccounts || []
      });
    }
  }, [isOpen, userProfile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setUserProfile({
      ...formData,
      isSetupComplete: true
    });
    completeSetup();
    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.defaultDomain.trim() && formData.companyName.trim() && formData.industry;
      case 1:
      case 2:
      case 3:
        return true; // These steps are optional
      default:
        return false;
    }
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addSocialAccount = () => {
    if (newSocialAccount.platform && newSocialAccount.handle.trim()) {
      const exists = formData.socialAccounts.some(
        acc => acc.platform === newSocialAccount.platform
      );
      
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          socialAccounts: [...prev.socialAccounts, { ...newSocialAccount }]
        }));
        setNewSocialAccount({ platform: '', handle: '' });
      }
    }
  };

  const removeSocialAccount = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      socialAccounts: prev.socialAccounts.filter(acc => acc.platform !== platform)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website Domain *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.defaultDomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultDomain: e.target.value }))}
                  placeholder="example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your Company Inc."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              >
                <option value="">Select your industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Competitors
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                  placeholder="competitor.com"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addCompetitor}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {formData.competitors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Competitors ({formData.competitors.length})
                </label>
                <div className="space-y-2">
                  {formData.competitors.map(competitor => (
                    <div key={competitor} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                      <span className="text-white">{competitor}</span>
                      <button
                        onClick={() => removeCompetitor(competitor)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Keywords to Track
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="your keyword"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addKeyword}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {formData.keywords.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tracking Keywords ({formData.keywords.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(keyword => (
                    <div key={keyword} className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                      <span className="text-white text-sm">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Social Media Accounts
              </label>
              <div className="flex space-x-2">
                <select
                  value={newSocialAccount.platform}
                  onChange={(e) => setNewSocialAccount(prev => ({ ...prev, platform: e.target.value }))}
                  className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                  <option value="">Platform</option>
                  {socialPlatforms.filter(platform => 
                    !formData.socialAccounts.some(acc => acc.platform === platform)
                  ).map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newSocialAccount.handle}
                  onChange={(e) => setNewSocialAccount(prev => ({ ...prev, handle: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && addSocialAccount()}
                  placeholder="@username"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSocialAccount}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {formData.socialAccounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connected Accounts ({formData.socialAccounts.length})
                </label>
                <div className="space-y-2">
                  {formData.socialAccounts.map(account => (
                    <div key={account.platform} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm text-white font-bold">
                          {account.platform[0]}
                        </div>
                        <div>
                          <div className="text-white font-medium">{account.platform}</div>
                          <div className="text-gray-400 text-sm">@{account.handle}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSocialAccount(account.platform)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 p-4 z-[60]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
              <div>
                <h2 className="text-2xl font-bold text-white">Quick Setup</h2>
                <p className="text-gray-400">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="px-6 py-4 bg-gray-800/50">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className={`flex items-center space-x-2 ${
                      index <= currentStep ? 'text-purple-400' : 'text-gray-500'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < currentStep 
                          ? 'bg-purple-600 text-white' 
                          : index === currentStep
                            ? 'bg-purple-600/20 border-2 border-purple-600 text-purple-400'
                            : 'bg-gray-700 text-gray-500'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${
                        index < currentStep ? 'bg-purple-600' : 'bg-gray-700'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickSetup;