import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, BookOpen, GitBranch, BarChart3, Settings,
  Plus, Search, Filter, Grid, List
} from 'lucide-react';
import BrandAssetUpload from './BrandAssetUpload';
import BrandAssetLibrary from './BrandAssetLibrary';
import BrandGuidelinesManager from './BrandGuidelinesManager';
import AssetVersionControl from './AssetVersionControl';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';

type TabType = 'library' | 'upload' | 'guidelines' | 'analytics' | 'settings';

const BrandAssetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [selectedAssetForVersions, setSelectedAssetForVersions] = useState<string | null>(null);
  const { assets, guidelines, analytics, initializeSampleData } = useBrandAssetsStore();

  // Initialize sample data if assets are empty
  React.useEffect(() => {
    if (assets.length === 0) {
      initializeSampleData();
    }
  }, [assets.length, initializeSampleData]);

  const tabs = [
    {
      id: 'library' as TabType,
      label: 'Asset Library',
      icon: Grid,
      count: assets.length
    },
    {
      id: 'upload' as TabType,
      label: 'Upload',
      icon: Upload,
      count: null
    },
    {
      id: 'guidelines' as TabType,
      label: 'Brand Guidelines',
      icon: BookOpen,
      count: guidelines.length
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
      count: null
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      count: null
    }
  ];

  const renderTabContent = () => {
    if (selectedAssetForVersions) {
      return (
        <AssetVersionControl
          assetId={selectedAssetForVersions}
          onClose={() => setSelectedAssetForVersions(null)}
        />
      );
    }

    switch (activeTab) {
      case 'library':
        return <BrandAssetLibrary />;
      case 'upload':
        return <BrandAssetUpload />;
      case 'guidelines':
        return <BrandGuidelinesManager />;
      case 'analytics':
        return <BrandAnalytics />;
      case 'settings':
        return <BrandAssetSettings />;
      default:
        return <BrandAssetLibrary />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Brand Asset Management</h1>
              <p className="text-gray-400">
                Centralized hub for managing brand assets, guidelines, and compliance
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-purple-700 text-purple-100'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAssetForVersions ? 'versions' : activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Placeholder components for analytics and settings
const BrandAnalytics: React.FC = () => {
  const { analytics } = useBrandAssetsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Brand Asset Analytics</h2>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Grid className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-medium text-gray-300">Total Assets</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.totalAssets}</div>
          <div className="text-sm text-gray-400">Across all clients</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-medium text-gray-300">Storage Used</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {(analytics.storageUsed / (1024 * 1024)).toFixed(1)}MB
          </div>
          <div className="text-sm text-gray-400">Of available space</div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/200/20 rounded-lg">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-300">Compliance Rate</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.complianceRate}%</div>
          <div className="text-sm text-gray-400">Assets meeting guidelines</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-medium text-gray-300">Avg. Usage</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.averageUsagePerAsset}</div>
          <div className="text-sm text-gray-400">Downloads per asset</div>
        </div>
      </div>

      {/* Most Used Assets */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Most Used Assets</h3>
        <div className="space-y-3">
          {analytics.mostUsedAssets.slice(0, 5).map((item, index) => (
            <div key={item.asset.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="text-gray-400 font-mono text-sm w-6">#{index + 1}</div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg flex items-center justify-center">
                <span className="text-lg">
                  {item.asset.type === 'logo' ? '🏢' : 
                   item.asset.type === 'image' ? '🖼️' : '📁'}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{item.asset.name}</div>
                <div className="text-sm text-gray-400 capitalize">{item.asset.type}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{item.usageCount}</div>
                <div className="text-sm text-gray-400">downloads</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Format Performance */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.topPerformingFormats.slice(0, 6).map((format) => (
            <div key={format.format} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white uppercase">{format.format}</span>
                <span className="text-sm text-gray-400">{format.count} assets</span>
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {format.averageDownloads}
              </div>
              <div className="text-sm text-gray-400">avg. downloads</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BrandAssetSettings: React.FC = () => {
  const { settings, updateSettings } = useBrandAssetsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Brand Asset Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Auto Approval</label>
                <p className="text-sm text-gray-400">Automatically approve uploaded assets</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproval}
                onChange={(e) => updateSettings({ ...settings, autoApproval: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Require Guidelines</label>
                <p className="text-sm text-gray-400">Require brand guidelines before uploading</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireGuidelines}
                onChange={(e) => updateSettings({ ...settings, requireGuidelines: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Enforce Naming</label>
                <p className="text-sm text-gray-400">Use naming convention template</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enforceNaming}
                onChange={(e) => updateSettings({ ...settings, enforceNaming: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Max File Size (MB)</label>
              <input
                type="number"
                value={settings.maxFileSize / (1024 * 1024)}
                onChange={(e) => updateSettings({ 
                  ...settings, 
                  maxFileSize: parseInt(e.target.value) * 1024 * 1024 
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
            </div>
          </div>
        </div>

        {/* Compression Settings */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Compression Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Enable Compression</label>
                <p className="text-sm text-gray-400">Automatically compress uploaded images</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compressionSettings.enabled}
                onChange={(e) => updateSettings({ 
                  ...settings, 
                  compressionSettings: { 
                    ...settings.compressionSettings, 
                    enabled: e.target.checked 
                  } 
                })}
                className="w-4 h-4 rounded"
              />
            </div>

            {settings.compressionSettings.enabled && (
              <>
                <div>
                  <label className="block text-white font-medium mb-2">Quality (%)</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={settings.compressionSettings.quality}
                    onChange={(e) => updateSettings({ 
                      ...settings, 
                      compressionSettings: { 
                        ...settings.compressionSettings, 
                        quality: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-400 text-center mt-1">
                    {settings.compressionSettings.quality}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Max Width (px)</label>
                    <input
                      type="number"
                      value={settings.compressionSettings.maxWidth}
                      onChange={(e) => updateSettings({ 
                        ...settings, 
                        compressionSettings: { 
                          ...settings.compressionSettings, 
                          maxWidth: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Max Height (px)</label>
                    <input
                      type="number"
                      value={settings.compressionSettings.maxHeight}
                      onChange={(e) => updateSettings({ 
                        ...settings, 
                        compressionSettings: { 
                          ...settings.compressionSettings, 
                          maxHeight: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAssetsPage;