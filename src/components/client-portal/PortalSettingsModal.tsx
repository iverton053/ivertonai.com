// Portal Settings Modal - Edit existing portal configuration

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Globe,
  Palette,
  Settings,
  Users,
  Shield,
  Download,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Upload
} from 'lucide-react';
import { useClientPortalStore } from '../../stores/clientPortalStore';
import { ClientPortal, PortalWidgetType } from '../../types/clientPortal';

interface PortalSettingsModalProps {
  isOpen: boolean;
  portal: ClientPortal | null;
  onClose: () => void;
}

const PortalSettingsModal: React.FC<PortalSettingsModalProps> = ({
  isOpen,
  portal,
  onClose
}) => {
  const { updatePortal } = useClientPortalStore();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientPortal>>({});
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (portal && isOpen) {
      setFormData(portal);
      setActiveTab('general');
    }
  }, [portal, isOpen]);

  const availableWidgets: { type: PortalWidgetType; label: string; description: string }[] = [
    { type: 'overview_stats', label: 'Overview Stats', description: 'Key performance metrics' },
    { type: 'seo_rankings', label: 'SEO Rankings', description: 'Keyword position tracking' },
    { type: 'website_traffic', label: 'Website Traffic', description: 'Visitor analytics' },
    { type: 'keyword_performance', label: 'Keyword Performance', description: 'Keyword insights' },
    { type: 'backlink_growth', label: 'Backlink Growth', description: 'Link building progress' },
    { type: 'social_media_metrics', label: 'Social Media', description: 'Social performance' },
    { type: 'content_performance', label: 'Content Performance', description: 'Content analytics' },
    { type: 'competitor_analysis', label: 'Competitor Analysis', description: 'Competitive insights' },
    { type: 'goals_progress', label: 'Goals Progress', description: 'Target achievement' }
  ];

  const handleSave = async () => {
    if (!portal) return;
    
    setIsSaving(true);
    try {
      await updatePortal(portal.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update portal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<ClientPortal>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateBranding = (updates: Partial<typeof portal.branding>) => {
    setFormData(prev => ({
      ...prev,
      branding: { ...prev.branding!, ...updates }
    }));
  };

  const updateTheme = (updates: Partial<typeof portal.theme>) => {
    setFormData(prev => ({
      ...prev,
      theme: { ...prev.theme!, ...updates }
    }));
  };

  const updateDashboardConfig = (updates: Partial<typeof portal.dashboard_config>) => {
    setFormData(prev => ({
      ...prev,
      dashboard_config: { ...prev.dashboard_config!, ...updates }
    }));
  };

  const updateAccessSettings = (updates: Partial<typeof portal.access_settings>) => {
    setFormData(prev => ({
      ...prev,
      access_settings: { ...prev.access_settings!, ...updates }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="w-4 h-4" /> },
    { id: 'widgets', label: 'Widgets', icon: <Settings className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Portal Status
          </label>
          <select
            value={formData.is_active ? 'active' : 'inactive'}
            onChange={(e) => updateFormData({ is_active: e.target.value === 'active' })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subdomain
          </label>
          <div className="flex">
            <input
              type="text"
              value={formData.subdomain || ''}
              onChange={(e) => updateFormData({ subdomain: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="px-3 py-2 bg-gray-600 border border-l-0 border-gray-600 rounded-r-lg text-gray-300">
              .youragency.com
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Custom Domain
        </label>
        <input
          type="text"
          value={formData.custom_domain || ''}
          onChange={(e) => updateFormData({ custom_domain: e.target.value })}
          placeholder="reports.clientdomain.com"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-400">
          Configure DNS settings to point this domain to your portal
        </p>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="font-medium text-white mb-3">Portal URLs</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Subdomain:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">
                https://{formData.subdomain}.youragency.com
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(`https://${formData.subdomain}.youragency.com`)}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          {formData.custom_domain && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Custom:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">
                  https://{formData.custom_domain}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(`https://${formData.custom_domain}`)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBrandingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.branding?.company_name || ''}
            onChange={(e) => updateBranding({ company_name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={formData.branding?.company_tagline || ''}
            onChange={(e) => updateBranding({ company_tagline: e.target.value })}
            placeholder="Your marketing performance dashboard"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Logo Upload
        </label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          {formData.branding?.logo_url ? (
            <div className="space-y-2">
              <img 
                src={formData.branding.logo_url} 
                alt="Logo" 
                className="h-16 mx-auto"
              />
              <button
                onClick={() => updateBranding({ logo_url: undefined })}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove Logo
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG up to 2MB
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.theme?.primary_color || '#6366f1'}
              onChange={(e) => updateTheme({ primary_color: e.target.value })}
              className="w-12 h-10 rounded border border-gray-600"
            />
            <input
              type="text"
              value={formData.theme?.primary_color || '#6366f1'}
              onChange={(e) => updateTheme({ primary_color: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              value={formData.theme?.secondary_color || '#8b5cf6'}
              onChange={(e) => updateTheme({ secondary_color: e.target.value })}
              className="w-12 h-10 rounded border border-gray-600"
            />
            <input
              type="text"
              value={formData.theme?.secondary_color || '#8b5cf6'}
              onChange={(e) => updateTheme({ secondary_color: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Theme Style
        </label>
        <select
          value={formData.theme?.layout_style || 'modern'}
          onChange={(e) => updateTheme({ layout_style: e.target.value as any })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="minimal">Minimal</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>
    </div>
  );

  const renderWidgetSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Enabled Widgets
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableWidgets.map(widget => (
            <div
              key={widget.type}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.dashboard_config?.enabled_widgets?.includes(widget.type)
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => {
                const currentWidgets = formData.dashboard_config?.enabled_widgets || [];
                const newWidgets = currentWidgets.includes(widget.type)
                  ? currentWidgets.filter(w => w !== widget.type)
                  : [...currentWidgets, widget.type];
                updateDashboardConfig({ enabled_widgets: newWidgets });
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{widget.label}</h4>
                  <p className="text-sm text-gray-400">{widget.description}</p>
                </div>
                {formData.dashboard_config?.enabled_widgets?.includes(widget.type) ? (
                  <Eye className="w-5 h-5 text-purple-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Allow Customization</h4>
            <p className="text-sm text-gray-400">
              Let clients customize their dashboard layout
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.dashboard_config?.allow_customization || false}
            onChange={(e) => updateDashboardConfig({ allow_customization: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Refresh Interval (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={formData.dashboard_config?.data_refresh_interval || 60}
              onChange={(e) => updateDashboardConfig({ data_refresh_interval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Historical Data Range (days)
            </label>
            <input
              type="number"
              min="7"
              max="365"
              value={formData.dashboard_config?.historical_data_range || 90}
              onChange={(e) => updateDashboardConfig({ historical_data_range: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Authentication Method
        </label>
        <div className="space-y-3">
          {['email_link', 'password'].map(method => (
            <div
              key={method}
              onClick={() => updateAccessSettings({ auth_method: method as any })}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.access_settings?.auth_method === method
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <h4 className="font-medium text-white capitalize">
                {method.replace('_', ' ')}
              </h4>
              <p className="text-sm text-gray-400">
                {method === 'email_link' 
                  ? 'Send secure login links via email'
                  : 'Traditional username and password login'
                }
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Require Two-Factor Authentication</h4>
            <p className="text-sm text-gray-400">
              Add an extra layer of security
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.access_settings?.require_2fa || false}
            onChange={(e) => updateAccessSettings({ require_2fa: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Allow Downloads</h4>
            <p className="text-sm text-gray-400">
              Let clients download reports and data
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.access_settings?.allow_downloads || false}
            onChange={(e) => updateAccessSettings({ allow_downloads: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Session Timeout (minutes)
          </label>
          <select
            value={formData.access_settings?.session_timeout || 480}
            onChange={(e) => updateAccessSettings({ session_timeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={60}>1 hour</option>
            <option value={240}>4 hours</option>
            <option value={480}>8 hours</option>
            <option value={1440}>24 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Concurrent Sessions
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.access_settings?.max_concurrent_sessions || 3}
            onChange={(e) => updateAccessSettings({ max_concurrent_sessions: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'branding':
        return renderBrandingSettings();
      case 'widgets':
        return renderWidgetSettings();
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">User management coming soon</p>
          </div>
        );
      case 'security':
        return renderSecuritySettings();
      default:
        return null;
    }
  };

  if (!portal) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex"
          >
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Portal Settings</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {formData.branding?.company_name || 'Configure your portal'}
                </p>
              </div>
              
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-bold text-white">
                    {tabs.find(t => t.id === activeTab)?.label} Settings
                  </h3>
                  {formData.is_active ? (
                    <span className="px-3 py-1 text-xs bg-green-900/30 text-green-400 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {renderTabContent()}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Last updated: {new Date(portal.updated_at).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortalSettingsModal;