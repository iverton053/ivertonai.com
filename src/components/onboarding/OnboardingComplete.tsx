import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Settings, BarChart3, Users } from 'lucide-react';
import { OnboardingFormData } from '../../types/onboarding';

interface OnboardingCompleteProps {
  clientData: Partial<OnboardingFormData>;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ clientData }) => {

  const handleGoToDashboard = () => {
    window.location.href = '/';
  };

  const handleViewClient = () => {
    window.location.href = '/';
  };

  const handleDownloadSummary = () => {
    console.log('Downloading client setup summary...');
  };

  const NEXT_STEPS = [
    {
      icon: BarChart3,
      title: 'Review Dashboard',
      description: 'Check your populated dashboard with client data',
      action: 'View Dashboard',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Manage Client',
      description: 'Access client profile and update information',
      action: 'View Client',
      color: 'blue'
    },
    {
      icon: Settings,
      title: 'Configure Workflows',
      description: 'Set up automation and n8n workflows',
      action: 'Setup Workflows',
      color: 'green'
    },
    {
      icon: Download,
      title: 'Download Summary',
      description: 'Get a PDF summary of the client setup',
      action: 'Download PDF',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-600/20 border-purple-400/30 text-purple-300',
      blue: 'bg-blue-600/20 border-blue-400/30 text-blue-300',
      green: 'bg-green-600/20 border-green-400/30 text-green-300',
      orange: 'bg-orange-600/20 border-orange-400/30 text-orange-300'
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm"
      >
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 10 }}
            className="mx-auto w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-2">
            🎉 Client Setup Complete!
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            {clientData.basicInfo?.company || 'Your client'} has been successfully added to your dashboard
          </p>
          <p className="text-gray-400">
            All widgets and automations are now configured with real client data
          </p>
        </motion.div>

        {/* Client Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-700/30 rounded-xl p-6 mb-8 border border-gray-600"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Client Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Company:</span>
              <p className="text-white font-medium">{clientData.basicInfo?.company || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400">Industry:</span>
              <p className="text-white font-medium">{clientData.basicInfo?.industry || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400">Budget:</span>
              <p className="text-white font-medium">
                {clientData.businessGoals?.monthlyBudget ? `$${clientData.businessGoals.monthlyBudget}/mo` : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Contact:</span>
              <p className="text-white font-medium">{clientData.contactInfo?.primary?.name || 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 text-center">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NEXT_STEPS.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.button
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (step.title === 'Review Dashboard') handleGoToDashboard();
                    else if (step.title === 'Manage Client') handleViewClient();
                    else if (step.title === 'Download Summary') handleDownloadSummary();
                  }}
                  className={`
                    p-6 rounded-xl border text-left transition-all duration-200 hover:scale-105
                    ${getColorClasses(step.color)}
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <IconComponent className="w-8 h-8 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-300 mb-3">{step.description}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{step.action}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Setup Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-700/30 rounded-xl p-6 mb-8 border border-gray-600"
        >
          <h3 className="text-lg font-semibold text-white mb-4">✅ What We've Set Up</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Client profile and contact information</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Business goals and target metrics</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">SEO keywords and competitor analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Social media account connections</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Marketing automation workflows</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Advertising platform integrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Reporting preferences and schedules</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Custom branding and visual identity</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToDashboard}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewClient}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>View Client</span>
          </motion.button>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 text-gray-400 text-sm"
        >
          <p>
            💡 <strong>Pro Tip:</strong> Your dashboard widgets are now populated with real client data.
            You can always update client information from the client management section.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OnboardingComplete;