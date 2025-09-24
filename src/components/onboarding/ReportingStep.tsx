import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Users, Mail, Slack, MessageSquare } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const REPORT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', description: 'Every Monday morning' },
  { value: 'bi-weekly', label: 'Bi-weekly', description: 'Every other Monday' },
  { value: 'monthly', label: 'Monthly', description: 'First Monday of each month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' }
];

const REPORT_TYPES = [
  { id: 'analytics', name: 'Website Analytics', description: 'Traffic, conversions, user behavior' },
  { id: 'seo', name: 'SEO Performance', description: 'Rankings, organic traffic, keyword performance' },
  { id: 'social', name: 'Social Media', description: 'Engagement, reach, follower growth' },
  { id: 'advertising', name: 'Advertising Performance', description: 'Ad spend, ROAS, campaign metrics' },
  { id: 'leads', name: 'Lead Generation', description: 'New leads, conversion rates, pipeline' },
  { id: 'revenue', name: 'Revenue Attribution', description: 'Revenue by channel, customer lifetime value' },
  { id: 'competitive', name: 'Competitive Analysis', description: 'Market position, competitor insights' },
  { id: 'custom', name: 'Custom Metrics', description: 'Business-specific KPIs and metrics' }
];

const COMMUNICATION_PREFERENCES = [
  { key: 'email', icon: Mail, label: 'Email Reports', description: 'Automated email delivery' },
  { key: 'slack', icon: Slack, label: 'Slack Integration', description: 'Real-time notifications' },
  { key: 'dashboard', icon: FileText, label: 'Dashboard Access', description: 'Always-available online dashboard' },
  { key: 'meetings', icon: MessageSquare, label: 'Regular Meetings', description: 'Scheduled review sessions' }
];

const MEETING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'as-needed', label: 'As Needed' }
];

const ReportingStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    frequency: 'monthly',
    reportTypes: ['analytics', 'seo', 'social'],
    recipients: [
      {
        name: formData.contactInfo?.primary?.name || '',
        email: formData.contactInfo?.primary?.email || '',
        role: 'Primary Contact'
      }
    ],
    communicationPrefs: {
      email: true,
      slack: false,
      dashboard: true,
      meetings: false
    },
    meetingFrequency: 'monthly',
    customMetrics: [],
    reportingNotes: '',
    dashboardAccess: {
      allowClientLogin: true,
      restrictSensitiveData: false,
      customBranding: true
    },
    alertSettings: {
      performanceAlerts: true,
      budgetAlerts: true,
      errorAlerts: true,
      goalAlerts: true
    },
    ...formData.reporting
  });

  useEffect(() => {
    onUpdate('reporting', localData);
  }, [localData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setLocalData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setLocalData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleReportTypeToggle = (reportId: string) => {
    const currentTypes = localData.reportTypes;
    if (currentTypes.includes(reportId)) {
      handleInputChange('reportTypes', currentTypes.filter(id => id !== reportId));
    } else {
      handleInputChange('reportTypes', [...currentTypes, reportId]);
    }
  };

  const addRecipient = () => {
    const newRecipient = {
      name: '',
      email: '',
      role: ''
    };
    handleInputChange('recipients', [...localData.recipients, newRecipient]);
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    const updatedRecipients = localData.recipients.map((recipient, i) =>
      i === index ? { ...recipient, [field]: value } : recipient
    );
    handleInputChange('recipients', updatedRecipients);
  };

  const removeRecipient = (index: number) => {
    const updatedRecipients = localData.recipients.filter((_, i) => i !== index);
    handleInputChange('recipients', updatedRecipients);
  };

  const addCustomMetric = () => {
    const metric = prompt('Enter custom metric name:');
    if (metric && !localData.customMetrics.includes(metric)) {
      handleInputChange('customMetrics', [...localData.customMetrics, metric]);
    }
  };

  const removeCustomMetric = (metricToRemove: string) => {
    handleInputChange('customMetrics', localData.customMetrics.filter(metric => metric !== metricToRemove));
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Reporting & Analytics Setup</h3>
        <p className="text-gray-400 mb-6">
          Configure how you want to receive reports and track performance
        </p>
      </motion.div>

      {/* Report Frequency */}
      <div>
        <label className="block text-sm font-medium text-white mb-4 flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Report Frequency</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_FREQUENCIES.map((freq) => (
            <motion.label
              key={freq.value}
              whileHover={{ scale: 1.02 }}
              className={`
                flex flex-col p-4 rounded-lg cursor-pointer transition-all duration-200 border
                ${localData.frequency === freq.value
                  ? 'bg-purple-600/20 border-purple-400 text-white'
                  : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              <input
                type="radio"
                name="frequency"
                value={freq.value}
                checked={localData.frequency === freq.value}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="sr-only"
              />
              <span className="font-medium mb-1">{freq.label}</span>
              <span className="text-sm opacity-80">{freq.description}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Report Types */}
      <div>
        <label className="block text-sm font-medium text-white mb-4">
          Report Types (select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_TYPES.map((type) => (
            <motion.label
              key={type.id}
              whileHover={{ scale: 1.01 }}
              className={`
                flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 border
                ${localData.reportTypes.includes(type.id)
                  ? 'bg-purple-600/20 border-purple-400'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={localData.reportTypes.includes(type.id)}
                onChange={() => handleReportTypeToggle(type.id)}
                className="rounded text-purple-600 focus:ring-purple-500 mt-1"
              />
              <div>
                <span className="text-white font-medium">{type.name}</span>
                <p className="text-sm text-gray-400">{type.description}</p>
              </div>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Recipients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-white flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Report Recipients</span>
          </label>
          <button
            onClick={addRecipient}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            + Add Recipient
          </button>
        </div>
        <div className="space-y-4">
          {localData.recipients.map((recipient, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600"
            >
              <input
                type="text"
                value={recipient.name}
                onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                placeholder="Full Name"
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <input
                type="email"
                value={recipient.email}
                onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                placeholder="Email Address"
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={recipient.role}
                  onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                  placeholder="Role/Title"
                  className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                {index > 0 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div>
        <label className="block text-sm font-medium text-white mb-4">
          Communication Preferences
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMUNICATION_PREFERENCES.map((pref) => {
            const IconComponent = pref.icon;
            return (
              <label
                key={pref.key}
                className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700/50"
              >
                <input
                  type="checkbox"
                  checked={localData.communicationPrefs[pref.key as keyof typeof localData.communicationPrefs]}
                  onChange={(e) => handleInputChange(`communicationPrefs.${pref.key}`, e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 mt-1"
                />
                <IconComponent className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <span className="text-white font-medium">{pref.label}</span>
                  <p className="text-sm text-gray-400">{pref.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Meeting Frequency */}
      {localData.communicationPrefs.meetings && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Meeting Frequency
          </label>
          <select
            value={localData.meetingFrequency}
            onChange={(e) => handleInputChange('meetingFrequency', e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {MEETING_FREQUENCIES.map(freq => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-white">
            Custom Metrics to Track
          </label>
          <button
            onClick={addCustomMetric}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            + Add Metric
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localData.customMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 bg-purple-600/20 border border-purple-400/30 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-white">{metric}</span>
              <button
                onClick={() => removeCustomMetric(metric)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dashboard Access Settings */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Dashboard Access Settings</h4>
        <div className="space-y-3">
          {[
            { key: 'allowClientLogin', label: 'Allow Client Dashboard Login', description: 'Clients can log in to view their dashboard' },
            { key: 'restrictSensitiveData', label: 'Restrict Sensitive Data', description: 'Hide cost data and internal metrics' },
            { key: 'customBranding', label: 'Custom Branding', description: 'Use client branding in dashboard and reports' }
          ].map((setting) => (
            <label
              key={setting.key}
              className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.dashboardAccess[setting.key as keyof typeof localData.dashboardAccess]}
                onChange={(e) => handleInputChange(`dashboardAccess.${setting.key}`, e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 mt-1"
              />
              <div>
                <span className="text-white font-medium">{setting.label}</span>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Alert Settings */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Alert Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'performanceAlerts', label: 'Performance Alerts', description: 'Traffic drops, conversion issues' },
            { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Ad spend thresholds exceeded' },
            { key: 'errorAlerts', label: 'Error Alerts', description: 'Technical issues detected' },
            { key: 'goalAlerts', label: 'Goal Alerts', description: 'Targets achieved or missed' }
          ].map((alert) => (
            <label
              key={alert.key}
              className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.alertSettings[alert.key as keyof typeof localData.alertSettings]}
                onChange={(e) => handleInputChange(`alertSettings.${alert.key}`, e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 mt-1"
              />
              <div>
                <span className="text-white font-medium">{alert.label}</span>
                <p className="text-sm text-gray-400">{alert.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Additional Reporting Notes
        </label>
        <textarea
          value={localData.reportingNotes}
          onChange={(e) => handleInputChange('reportingNotes', e.target.value)}
          placeholder="Any specific reporting requirements, metrics to focus on, or communication preferences..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
      >
        Continue to Branding
      </motion.button>
    </div>
  );
};

export default ReportingStep;