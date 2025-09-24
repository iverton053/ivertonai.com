import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Users, Database, Gavel } from 'lucide-react';

const TermsConditions = () => {
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
            <Gavel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Iverton AI services
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="prose prose-invert max-w-none">
            
            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p className="text-gray-300 mb-6">
              By accessing and using Iverton AI's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <span>2. Use License</span>
            </h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily download one copy of Iverton AI's materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on our platform</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="flex items-center space-x-2 text-2xl font-semibold text-white mb-4">
              <Database className="w-6 h-6 text-purple-400" />
              <span>3. Data Privacy & Security</span>
            </h2>
            <p className="text-gray-300 mb-6">
              Your privacy is important to us. We implement industry-standard security measures to protect your data. All data processing is conducted in accordance with applicable data protection laws, including GDPR and CCPA. For detailed information about how we collect, use, and protect your data, please review our Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">4. Service Availability</h2>
            <p className="text-gray-300 mb-6">
              While we strive for 99.9% uptime, Iverton AI services are provided "as is" without warranties of any kind. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">5. Payment Terms</h2>
            <p className="text-gray-300 mb-6">
              Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice to existing customers.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-300 mb-4">You may not use our service:</p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-300 mb-6">
              In no event shall Iverton AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use our services, even if Iverton AI or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">8. Governing Law</h2>
            <p className="text-gray-300 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>

            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-purple-900/30 rounded-lg p-4">
              <p className="text-white"><strong>Email:</strong> legal@iverton.ai</p>
              <p className="text-white"><strong>Address:</strong> [Your Business Address]</p>
              <p className="text-white"><strong>Phone:</strong> [Your Phone Number]</p>
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

export default TermsConditions;