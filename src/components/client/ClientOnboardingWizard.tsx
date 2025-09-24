import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Building,
  User,
  Settings,
  Palette,
  Link,
  Target
} from 'lucide-react';
import { useComprehensiveClientStore } from '../../stores/comprehensiveClientStore';

const ClientOnboardingWizard: React.FC = () => {
  const {
    showOnboardingWizard,
    setShowOnboardingWizard,
    onboardingData,
    selectedClient,
    completeOnboardingStep,
    finishOnboarding
  } = useComprehensiveClientStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!showOnboardingWizard || !selectedClient || !onboardingData[selectedClient.id]) {
    return null;
  }

  const clientOnboarding = onboardingData[selectedClient.id];
  const steps = clientOnboarding.steps;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleCompleteStep = (data: any) => {
    completeOnboardingStep(selectedClient.id, currentStep.id, data);
    
    if (currentStepIndex === steps.length - 1) {
      // Last step completed
      finishOnboarding(selectedClient.id);
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    if (currentStepIndex === steps.length - 1) {
      finishOnboarding(selectedClient.id);
    } else {
      handleNext();
    }
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'basic_info': return User;
      case 'social_media': return Link;
      case 'business_details': return Target;
      case 'dashboard_setup': return Settings;
      case 'branding': return Palette;
      case 'integrations': return Building;
      default: return Settings;
    }
  };

  return (
    <AnimatePresence>
      {showOnboardingWizard && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Wizard Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-600 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Welcome to {selectedClient.name}!
                  </h2>
                  <p className="text-gray-400">
                    Let's get your client set up with a few quick steps
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowOnboardingWizard(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <span className="text-sm text-purple-400">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                />
              </div>
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-4">
                {steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.id);
                  const isActive = index === currentStepIndex;
                  const isCompleted = step.completed;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center space-y-2 ${
                        isActive ? 'text-purple-400' : 
                        isCompleted ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive ? 'border-purple-400 bg-purple-600/20' :
                        isCompleted ? 'border-green-400 bg-green-600/20' : 'border-gray-600'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs text-center">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {currentStep.title}
                  </h3>
                  <p className="text-gray-400">
                    {currentStep.description}
                  </p>
                </div>

                {/* Step Content */}
                <div className="space-y-6">
                  {currentStep.id === 'basic_info' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Basic Information Complete!
                      </h4>
                      <p className="text-gray-400">
                        We've collected your basic company information. Next, let's connect your social media accounts.
                      </p>
                    </div>
                  )}

                  {currentStep.id === 'social_media' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Link className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Social Media Setup
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Connect your social media accounts to track engagement and schedule posts.
                      </p>
                      <div className="text-left bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-300">
                          <strong>Popular platforms:</strong> Facebook, Instagram, Twitter, LinkedIn
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          You can connect these later in the integrations section.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'business_details' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Business Goals & Services
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Your services and goals have been configured based on your industry.
                      </p>
                      <div className="text-left bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Services:</strong> {selectedClient.business?.services.slice(0, 3).join(', ')}
                          {selectedClient.business?.services.length > 3 && ` +${selectedClient.business.services.length - 3} more`}
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong>Goals:</strong> {selectedClient.business?.goals.slice(0, 2).join(', ')}
                          {selectedClient.business?.goals.length > 2 && ` +${selectedClient.business.goals.length - 2} more`}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'dashboard_setup' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Settings className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Dashboard Configuration
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Your dashboard widgets have been configured for optimal insights.
                      </p>
                      <div className="text-left bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-300">
                          <strong>Active Widgets:</strong> {selectedClient.dashboard?.enabled_widgets.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          You can customize these anytime from the dashboard settings.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'branding' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Palette className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Branding & Theme
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Your brand colors and theme preferences have been set.
                      </p>
                      <div className="text-left bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-6 h-6 rounded border-2 border-gray-600"
                              style={{ backgroundColor: selectedClient.branding?.primary_color }}
                            />
                            <span className="text-sm text-gray-300">Primary</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-6 h-6 rounded border-2 border-gray-600"
                              style={{ backgroundColor: selectedClient.branding?.secondary_color }}
                            />
                            <span className="text-sm text-gray-300">Secondary</span>
                          </div>
                          <span className="text-sm text-gray-400">
                            Theme: {selectedClient.branding?.theme}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'integrations' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Ready to Launch! 🎉
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Your client setup is complete. You can now start managing their campaigns and tracking performance.
                      </p>
                      <div className="text-left bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-green-400 mb-2">Next Steps:</h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Connect social media accounts in Settings</li>
                          <li>• Import existing analytics data</li>
                          <li>• Set up automated reports</li>
                          <li>• Configure team member access</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                {!currentStep.required && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCompleteStep({})}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>
                    {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Continue'}
                  </span>
                  {currentStepIndex === steps.length - 1 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ClientOnboardingWizard;