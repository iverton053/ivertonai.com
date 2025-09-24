import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, MessageSquare } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const COMMUNICATION_METHODS = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Primary communication via email' },
  { value: 'phone', label: 'Phone', icon: Phone, description: 'Prefer phone calls and SMS' },
  { value: 'slack', label: 'Slack', icon: MessageSquare, description: 'Team communication via Slack' },
  { value: 'teams', label: 'Microsoft Teams', icon: MessageSquare, description: 'Video calls and chat' }
];

const ContactDetailsStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  errors
}) => {
  const [localData, setLocalData] = useState({
    primary: {
      name: formData.contactInfo?.primary?.name || '',
      email: formData.contactInfo?.primary?.email || '',
      phone: formData.contactInfo?.primary?.phone || '',
      position: formData.contactInfo?.primary?.position || ''
    },
    secondary: {
      name: formData.contactInfo?.secondary?.name || '',
      email: formData.contactInfo?.secondary?.email || '',
      phone: formData.contactInfo?.secondary?.phone || '',
      position: formData.contactInfo?.secondary?.position || ''
    },
    businessAddress: {
      street: formData.contactInfo?.businessAddress?.street || '',
      city: formData.contactInfo?.businessAddress?.city || '',
      state: formData.contactInfo?.businessAddress?.state || '',
      country: formData.contactInfo?.businessAddress?.country || '',
      postalCode: formData.contactInfo?.businessAddress?.postalCode || ''
    },
    preferredCommunication: formData.contactInfo?.preferredCommunication || 'email'
  });

  const [showSecondaryContact, setShowSecondaryContact] = useState(
    !!(formData.contactInfo?.secondary?.name || formData.contactInfo?.secondary?.email)
  );

  // Update parent when local data changes
  useEffect(() => {
    onUpdate('contactInfo', localData);
  }, [localData, onUpdate]);

  const handleInputChange = (section: string, field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as object,
        [field]: value
      }
    }));
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (numbers.length >= 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
    return phone;
  };

  const handlePhoneChange = (section: string, value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange(section, 'phone', formatted);
  };

  return (
    <div className="space-y-8">
      {/* Primary Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-purple-400" />
          <span>Primary Contact *</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={localData.primary.name}
              onChange={(e) => handleInputChange('primary', 'name', e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Position/Title
            </label>
            <input
              type="text"
              value={localData.primary.position}
              onChange={(e) => handleInputChange('primary', 'position', e.target.value)}
              placeholder="CEO, Marketing Director, etc."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={localData.primary.email}
                onChange={(e) => handleInputChange('primary', 'email', e.target.value)}
                placeholder="john@company.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={localData.primary.phone}
                onChange={(e) => handlePhoneChange('primary', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Secondary Contact Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <div>
            <h4 className="font-medium text-white">Secondary Contact</h4>
            <p className="text-sm text-gray-400">Add a backup contact person (optional)</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSecondaryContact(!showSecondaryContact)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${showSecondaryContact
                ? 'bg-purple-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }
            `}
          >
            {showSecondaryContact ? 'Remove' : 'Add Secondary'}
          </motion.button>
        </div>
      </motion.div>

      {/* Secondary Contact Form */}
      {showSecondaryContact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <span>Secondary Contact</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={localData.secondary.name}
                onChange={(e) => handleInputChange('secondary', 'name', e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Position/Title
              </label>
              <input
                type="text"
                value={localData.secondary.position}
                onChange={(e) => handleInputChange('secondary', 'position', e.target.value)}
                placeholder="Operations Manager"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={localData.secondary.email}
                  onChange={(e) => handleInputChange('secondary', 'email', e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={localData.secondary.phone}
                  onChange={(e) => handlePhoneChange('secondary', e.target.value)}
                  placeholder="(555) 987-6543"
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Business Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Building className="w-5 h-5 text-green-400" />
          <span>Business Address</span>
        </h4>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={localData.businessAddress.street}
              onChange={(e) => handleInputChange('businessAddress', 'street', e.target.value)}
              placeholder="123 Business St, Suite 100"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                City
              </label>
              <input
                type="text"
                value={localData.businessAddress.city}
                onChange={(e) => handleInputChange('businessAddress', 'city', e.target.value)}
                placeholder="New York"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={localData.businessAddress.state}
                onChange={(e) => handleInputChange('businessAddress', 'state', e.target.value)}
                placeholder="NY"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={localData.businessAddress.postalCode}
                onChange={(e) => handleInputChange('businessAddress', 'postalCode', e.target.value)}
                placeholder="10001"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Country
            </label>
            <select
              value={localData.businessAddress.country}
              onChange={(e) => handleInputChange('businessAddress', 'country', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            >
              <option value="">Select Country</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Communication Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-orange-400" />
          <span>Communication Preferences</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMUNICATION_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <motion.label
                key={method.value}
                whileHover={{ scale: 1.02 }}
                className={`
                  flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border
                  ${localData.preferredCommunication === method.value
                    ? 'bg-orange-600/20 border-orange-400 text-white'
                    : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 text-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="preferredCommunication"
                  value={method.value}
                  checked={localData.preferredCommunication === method.value}
                  onChange={(e) => setLocalData(prev => ({ ...prev, preferredCommunication: e.target.value as any }))}
                  className="sr-only"
                />
                <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-orange-400" />
                <div>
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm opacity-80">{method.description}</div>
                </div>
              </motion.label>
            );
          })}
        </div>
      </motion.div>

      {/* Contact Summary */}
      {localData.primary.name && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gray-700/30 rounded-xl border border-gray-600"
        >
          <h4 className="text-lg font-semibold text-white mb-3">Contact Summary</h4>
          <div className="space-y-2 text-gray-300">
            <p><strong>Primary:</strong> {localData.primary.name} ({localData.primary.position})</p>
            <p><strong>Email:</strong> {localData.primary.email}</p>
            <p><strong>Phone:</strong> {localData.primary.phone}</p>
            {showSecondaryContact && localData.secondary.name && (
              <p><strong>Secondary:</strong> {localData.secondary.name} ({localData.secondary.position})</p>
            )}
            <p><strong>Communication:</strong> {COMMUNICATION_METHODS.find(m => m.value === localData.preferredCommunication)?.label}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContactDetailsStep;