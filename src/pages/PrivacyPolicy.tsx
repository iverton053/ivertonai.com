import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Cookie, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const handleBackToLanding = () => {
    window.location.href = '/?page=landing';
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="glass-effect border-b border-purple-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleBackToLanding}
              className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Iverton AI</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-sm opacity-60"></div>
                <img src="/logo.png" alt="Iverton AI" className="relative h-8 w-8 rounded-xl border-2 border-purple-400/50 bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-1" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Iverton AI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            
            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Eye className="w-6 h-6 text-purple-400" />
              <span>1. Information We Collect</span>
            </h2>
            <p className="text-gray-300 mb-4">We collect information you provide directly to us, such as:</p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, company name, and password</li>
              <li><strong>Profile Data:</strong> Job title, company size, and industry information</li>
              <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
              <li><strong>Communication Data:</strong> Messages, support tickets, and feedback</li>
              <li><strong>Payment Information:</strong> Billing address and payment method (processed securely through third parties)</li>
            </ul>

            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <UserCheck className="w-6 h-6 text-purple-400" />
              <span>2. How We Use Your Information</span>
            </h2>
            <p className="text-gray-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Develop new products and services</li>
              <li>Monitor and analyze trends and usage patterns</li>
            </ul>

            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
              <span>3. Information Sharing and Security</span>
            </h2>
            <p className="text-gray-300 mb-4">We do not sell, trade, or rent your personal information. We may share your information only in these limited circumstances:</p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li><strong>With your consent:</strong> When you explicitly agree to sharing</li>
              <li><strong>Service providers:</strong> Third parties who assist in operating our platform</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>

            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Cookie className="w-6 h-6 text-purple-400" />
              <span>4. Cookies and Tracking</span>
            </h2>
            <p className="text-gray-300 mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our services</li>
              <li>Improve our platform performance</li>
              <li>Provide personalized experiences</li>
            </ul>
            <p className="text-gray-300 mb-6">
              You can control cookie settings through your browser, but some features may not work properly if cookies are disabled.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
            <p className="text-gray-300 mb-6">
              We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legitimate business purposes or legal requirements even after account closure.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Update:</strong> Correct inaccurate or outdated information</li>
              <li><strong>Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request your data in a structured format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>

            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Globe className="w-6 h-6 text-purple-400" />
              <span>7. International Transfers</span>
            </h2>
            <p className="text-gray-300 mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 mb-6">
              Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-purple-900/30 rounded-lg p-4">
              <p className="text-white"><strong>Email:</strong> privacy@iverton.ai</p>
              <p className="text-white"><strong>Address:</strong> [Your Business Address]</p>
              <p className="text-white"><strong>Phone:</strong> [Your Phone Number]</p>
              <p className="text-white"><strong>Data Protection Officer:</strong> dpo@iverton.ai</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={handleBackToLanding}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Iverton AI</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;