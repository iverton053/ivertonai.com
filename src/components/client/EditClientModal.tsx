import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertTriangle, Building, Globe, Mail, Phone, MapPin, Target, Tag, Palette, Settings } from 'lucide-react';
import { useComprehensiveClientStore } from '../../stores/comprehensiveClientStore';
import { ComprehensiveClient } from '../../types/comprehensiveClient';

const EditClientModal: React.FC = () => {
  const {
    showEditClientModal,
    editingClientId,
    getClientById,
    updateClient,
    setShowEditClientModal,
    setUnsavedChanges,
    finishEditingClient,
    cancelEditingClient,
    unsavedChanges
  } = useComprehensiveClientStore();

  const [formData, setFormData] = useState<Partial<ComprehensiveClient> | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const client = editingClientId ? getClientById(editingClientId) : null;

  useEffect(() => {
    if (client) {
      setFormData(client);
      setErrors({});
    }
  }, [client]);

  const handleInputChange = (path: string, value: any) => {
    if (!formData) return;

    const keys = path.split('.');
    const updatedData = { ...formData };
    let current: any = updatedData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(updatedData);
    setUnsavedChanges(true);

    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData?.name?.trim()) {
      newErrors['name'] = 'Client name is required';
    }

    if (!formData?.company?.trim()) {
      newErrors['company'] = 'Company name is required';
    }

    if (formData?.website && formData.website.trim() && !formData.website.match(/^https?:\/\//)) {
      newErrors['website'] = 'Website must start with http:// or https://';
    }

    if (formData?.contact?.primary_email && !formData.contact.primary_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors['contact.primary_email'] = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!formData || !editingClientId) return;

    if (!validateForm()) return;

    const success = await updateClient(editingClientId, formData);
    if (success) {
      finishEditingClient();
    }
  };

  const handleCancel = () => {
    cancelEditingClient();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'business', label: 'Business', icon: Target },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!showEditClientModal || !formData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleCancel}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-600 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Edit Client</h2>
                <p className="text-gray-400 text-sm">{formData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unsavedChanges && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar Tabs */}
            <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Enter client name"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.company ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Enter company name"
                      />
                      {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.website ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="https://example.com"
                        />
                      </div>
                      {errors.website && <p className="text-red-400 text-sm mt-1">{errors.website}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Industry
                      </label>
                      <select
                        value={formData.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Local Services">Local Services</option>
                        <option value="Education">Education</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Size
                      </label>
                      <select
                        value={formData.company_size || ''}
                        onChange={(e) => handleInputChange('company_size', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Size</option>
                        <option value="small">Small (1-10 employees)</option>
                        <option value="medium">Medium (11-50 employees)</option>
                        <option value="large">Large (51-200 employees)</option>
                        <option value="enterprise">Enterprise (200+ employees)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status || ''}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="paused">Paused</option>
                        <option value="prospect">Prospect</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.contact?.primary_name || ''}
                        onChange={(e) => handleInputChange('contact.primary_name', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.contact?.primary_email || ''}
                          onChange={(e) => handleInputChange('contact.primary_email', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors['contact.primary_email'] ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors['contact.primary_email'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['contact.primary_email']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.contact?.primary_phone || ''}
                          onChange={(e) => handleInputChange('contact.primary_phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={formData.contact?.timezone || ''}
                        onChange={(e) => handleInputChange('contact.timezone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.contact?.address?.street || ''}
                            onChange={(e) => handleInputChange('contact.address.street', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Street Address"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.contact?.address?.city || ''}
                        onChange={(e) => handleInputChange('contact.address.city', e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={formData.contact?.address?.state || ''}
                        onChange={(e) => handleInputChange('contact.address.state', e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="State/Province"
                      />
                      <input
                        type="text"
                        value={formData.contact?.address?.postal_code || ''}
                        onChange={(e) => handleInputChange('contact.address.postal_code', e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Postal Code"
                      />
                      <input
                        type="text"
                        value={formData.contact?.address?.country || ''}
                        onChange={(e) => handleInputChange('contact.address.country', e.target.value)}
                        className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Services
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(formData.business?.services || []).map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {service}
                          <button
                            onClick={() => {
                              const updatedServices = formData.business?.services?.filter((_, i) => i !== index) || [];
                              handleInputChange('business.services', updatedServices);
                            }}
                            className="ml-2 text-purple-400 hover:text-purple-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newService"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add a service (e.g., SEO, PPC, Social Media)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const value = input.value.trim();
                            if (value && !(formData.business?.services || []).includes(value)) {
                              const updatedServices = [...(formData.business?.services || []), value];
                              handleInputChange('business.services', updatedServices);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('newService') as HTMLInputElement;
                          const value = input.value.trim();
                          if (value && !(formData.business?.services || []).includes(value)) {
                            const updatedServices = [...(formData.business?.services || []), value];
                            handleInputChange('business.services', updatedServices);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Goals
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(formData.business?.goals || []).map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-sm"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          {goal}
                          <button
                            onClick={() => {
                              const updatedGoals = formData.business?.goals?.filter((_, i) => i !== index) || [];
                              handleInputChange('business.goals', updatedGoals);
                            }}
                            className="ml-2 text-yellow-400 hover:text-yellow-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newGoal"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add a business goal"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const value = input.value.trim();
                            if (value && !(formData.business?.goals || []).includes(value)) {
                              const updatedGoals = [...(formData.business?.goals || []), value];
                              handleInputChange('business.goals', updatedGoals);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('newGoal') as HTMLInputElement;
                          const value = input.value.trim();
                          if (value && !(formData.business?.goals || []).includes(value)) {
                            const updatedGoals = [...(formData.business?.goals || []), value];
                            handleInputChange('business.goals', updatedGoals);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <textarea
                      value={formData.business?.target_audience || ''}
                      onChange={(e) => handleInputChange('business.target_audience', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe your target audience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.business?.currency || 'USD'}
                      onChange={(e) => handleInputChange('business.currency', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Branding & Theme</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.branding?.primary_color || '#007bff'}
                          onChange={(e) => handleInputChange('branding.primary_color', e.target.value)}
                          className="w-12 h-12 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.branding?.primary_color || '#007bff'}
                          onChange={(e) => handleInputChange('branding.primary_color', e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="#007bff"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.branding?.secondary_color || '#6c757d'}
                          onChange={(e) => handleInputChange('branding.secondary_color', e.target.value)}
                          className="w-12 h-12 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.branding?.secondary_color || '#6c757d'}
                          onChange={(e) => handleInputChange('branding.secondary_color', e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="#6c757d"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleInputChange('branding.theme', 'light')}
                          className={`p-4 border rounded-lg transition-colors ${
                            formData.branding?.theme === 'light'
                              ? 'border-purple-500 bg-purple-600/20 text-white'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="w-full h-12 bg-white rounded mb-2"></div>
                          <span className="font-medium">Light Theme</span>
                        </button>
                        <button
                          onClick={() => handleInputChange('branding.theme', 'dark')}
                          className={`p-4 border rounded-lg transition-colors ${
                            formData.branding?.theme === 'dark'
                              ? 'border-purple-500 bg-purple-600/20 text-white'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="w-full h-12 bg-gray-800 rounded mb-2"></div>
                          <span className="font-medium">Dark Theme</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <h4 className="font-medium text-white mb-2">Preview</h4>
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 rounded-lg"
                        style={{ backgroundColor: formData.branding?.primary_color || '#007bff' }}
                      ></div>
                      <div
                        className="w-16 h-16 rounded-lg"
                        style={{ backgroundColor: formData.branding?.secondary_color || '#6c757d' }}
                      ></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{formData.name}</p>
                        <p className="text-gray-400 text-sm">
                          {formData.branding?.theme === 'light' ? 'Light Theme' : 'Dark Theme'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div>
                        <h4 className="font-medium text-white">Email Reports</h4>
                        <p className="text-gray-400 text-sm">Send automated reports via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications?.notification_preferences?.email_reports || false}
                          onChange={(e) => handleInputChange('notifications.notification_preferences.email_reports', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div>
                        <h4 className="font-medium text-white">SMS Alerts</h4>
                        <p className="text-gray-400 text-sm">Receive urgent alerts via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications?.notification_preferences?.sms_alerts || false}
                          onChange={(e) => handleInputChange('notifications.notification_preferences.sms_alerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Report Frequency
                      </label>
                      <select
                        value={formData.notifications?.notification_preferences?.frequency || 'weekly'}
                        onChange={(e) => handleInputChange('notifications.notification_preferences.frequency', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reporting Frequency
                      </label>
                      <select
                        value={formData.reporting?.frequency || 'monthly'}
                        onChange={(e) => handleInputChange('reporting.frequency', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div>
                        <h4 className="font-medium text-white">Auto-send Reports</h4>
                        <p className="text-gray-400 text-sm">Automatically send reports to client</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.reporting?.auto_send || false}
                          onChange={(e) => handleInputChange('reporting.auto_send', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/30">
            <div className="text-sm text-gray-400">
              {Object.keys(errors).length > 0 && (
                <span className="text-red-400">Please fix the errors above</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={Object.keys(errors).length > 0}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditClientModal;