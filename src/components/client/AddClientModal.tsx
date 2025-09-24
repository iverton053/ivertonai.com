import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building, 
  Globe, 
  Mail, 
  Phone, 
  User,
  Briefcase,
  MapPin,
  Palette
} from 'lucide-react';
import { useComprehensiveClientStore } from '../../stores/comprehensiveClientStore';
import { ComprehensiveClient } from '../../types/comprehensiveClient';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient, clientTemplates, createClientFromTemplate } = useComprehensiveClientStore();
  
  const [step, setStep] = useState<'method' | 'template' | 'manual'>('method');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    website: '',
    industry: 'Other',
    company_size: 'small' as ComprehensiveClient['company_size'],
    contact: {
      primary_name: '',
      primary_email: '',
      primary_phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'United States',
        postal_code: ''
      },
      timezone: 'UTC'
    },
    business: {
      services: [] as string[],
      goals: [] as string[],
      target_audience: ''
    }
  });

  const industries = [
    'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education',
    'Real Estate', 'Hospitality', 'Retail', 'Manufacturing', 'Consulting',
    'Legal', 'Non-profit', 'Media & Entertainment', 'Fashion', 'Food & Beverage',
    'Automotive', 'Construction', 'Energy', 'Other'
  ];

  const services = [
    'SEO', 'PPC', 'Social Media Marketing', 'Content Marketing', 'Email Marketing',
    'Web Development', 'Graphic Design', 'Brand Strategy', 'Analytics & Reporting',
    'Lead Generation', 'Conversion Optimization', 'Local SEO', 'E-commerce Marketing'
  ];

  const goals = [
    'Increase website traffic', 'Generate more leads', 'Boost online sales',
    'Improve brand awareness', 'Enhance social media presence', 'Increase conversions',
    'Expand market reach', 'Launch new products', 'Improve customer retention',
    'Build thought leadership', 'Increase local visibility'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child, subchild] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: subchild ? {
            ...(prev[parent as keyof typeof prev] as any)[child],
            [subchild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const [parent, child] = field.split('.');
    const currentArray = parent ? formData[parent as keyof typeof formData][child as any] : [];
    
    if (checked) {
      handleInputChange(field, [...currentArray, value]);
    } else {
      handleInputChange(field, currentArray.filter((item: string) => item !== value));
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    
    const template = clientTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    const clientName = formData.name || `New ${template.industry} Client`;
    const success = await createClientFromTemplate(selectedTemplate, clientName);
    
    if (success) {
      onClose();
      resetForm();
    }
  };

  const handleManualCreate = async () => {
    const clientData: Partial<ComprehensiveClient> = {
      ...formData,
      company: formData.company || formData.name
    };
    
    const success = await addClient(clientData);
    
    if (success) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStep('method');
    setSelectedTemplate('');
    setFormData({
      name: '',
      company: '',
      website: '',
      industry: 'Other',
      company_size: 'small',
      contact: {
        primary_name: '',
        primary_email: '',
        primary_phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: 'United States',
          postal_code: ''
        },
        timezone: 'UTC'
      },
      business: {
        services: [],
        goals: [],
        target_audience: ''
      }
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] bg-gray-900 border border-gray-600 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Add New Client</h2>
                  <p className="text-gray-400 text-sm">
                    {step === 'method' && 'Choose how you want to add a client'}
                    {step === 'template' && 'Select a template to get started quickly'}
                    {step === 'manual' && 'Enter client details manually'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Method Selection */}
              {step === 'method' && (
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('template')}
                    className="w-full p-6 border-2 border-gray-600 rounded-xl hover:border-purple-500/50 hover:bg-purple-600/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Use Template</h3>
                        <p className="text-gray-400">Quick setup with pre-configured industry templates</p>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('manual')}
                    className="w-full p-6 border-2 border-gray-600 rounded-xl hover:border-purple-500/50 hover:bg-purple-600/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Manual Setup</h3>
                        <p className="text-gray-400">Custom configuration with full control over settings</p>
                      </div>
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Template Selection */}
              {step === 'template' && (
                <div className="space-y-4">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter client name..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {clientTemplates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'border-purple-500 bg-purple-600/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{template.name}</h4>
                          <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                            {template.industry}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.default_services.slice(0, 3).map((service) => (
                            <span
                              key={service}
                              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                            >
                              {service}
                            </span>
                          ))}
                          {template.default_services.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{template.default_services.length - 3} more
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Form */}
              {step === 'manual' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      >
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Primary Contact Name
                        </label>
                        <input
                          type="text"
                          value={formData.contact.primary_name}
                          onChange={(e) => handleInputChange('contact.primary_name', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.contact.primary_email}
                          onChange={(e) => handleInputChange('contact.primary_email', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Services
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {services.map((service) => (
                        <label key={service} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.business.services.includes(service)}
                            onChange={(e) => handleArrayChange('business.services', service, e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-300">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
              <button
                onClick={step === 'method' ? handleClose : () => setStep(step === 'template' ? 'method' : 'method')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {step === 'method' ? 'Cancel' : 'Back'}
              </button>
              
              <div className="flex space-x-3">
                {step === 'template' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateFromTemplate}
                    disabled={!selectedTemplate || !formData.name}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Create Client
                  </motion.button>
                )}
                
                {step === 'manual' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleManualCreate}
                    disabled={!formData.name || !formData.contact.primary_email}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Create Client
                  </motion.button>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddClientModal;