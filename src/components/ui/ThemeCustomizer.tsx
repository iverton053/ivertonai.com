import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Minimize2,
  Maximize2,
  Sliders,
  RotateCcw,
  Download,
  Upload,
  X,
  Check
} from 'lucide-react';
import themeService, { ThemeMode, ColorScheme, ThemeConfig, ThemeColors } from '../../services/themeService';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ThemeConfig>(themeService.getConfig());
  const [colors, setColors] = useState<ThemeColors>(themeService.getColors());
  const [activeTab, setActiveTab] = useState<'appearance' | 'colors' | 'layout' | 'presets'>('appearance');
  const [importData, setImportData] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    const unsubscribe = themeService.onThemeChange((newConfig, newColors) => {
      setConfig(newConfig);
      setColors(newColors);
    });

    return unsubscribe;
  }, []);

  const handleModeChange = (mode: ThemeMode) => {
    themeService.setMode(mode);
  };

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    themeService.setColorScheme(scheme);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    themeService.setFontSize(size);
  };

  const handleTransparencyChange = (transparency: number) => {
    themeService.setTransparency(transparency);
  };

  const handlePresetApply = (preset: 'default' | 'minimal' | 'vibrant' | 'professional') => {
    themeService.applyPreset(preset);
  };

  const handleExport = () => {
    const data = themeService.exportTheme();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-hub-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = themeService.importTheme(importData);
      if (success) {
        setImportData('');
        setShowImportExport(false);
      } else {
        alert('Failed to import theme. Please check the format.');
      }
    }
  };

  const colorSchemes: Array<{ id: ColorScheme; name: string; color: string }> = [
    { id: 'default', name: 'Default', color: '#64748b' },
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'green', name: 'Green', color: '#22c55e' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4' }
  ];

  const presets = [
    {
      id: 'default' as const,
      name: 'Default',
      description: 'Balanced purple theme with standard spacing',
      preview: ['#a855f7', '#1e293b', '#f8fafc']
    },
    {
      id: 'minimal' as const,
      name: 'Minimal',
      description: 'Clean and simple with neutral colors',
      preview: ['#64748b', '#1e293b', '#f8fafc']
    },
    {
      id: 'vibrant' as const,
      name: 'Vibrant',
      description: 'Bold cyan theme with enhanced transparency',
      preview: ['#06b6d4', '#1e293b', '#f0f9ff']
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      description: 'Corporate blue with high contrast',
      preview: ['#2563eb', '#1e293b', '#eff6ff']
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Theme Customizer</h2>
                <p className="text-gray-400 text-sm">Personalize your AI Hub experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowImportExport(!showImportExport)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Import/Export theme"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                onClick={themeService.reset}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Import/Export Panel */}
          <AnimatePresence>
            {showImportExport && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-b border-gray-700 bg-gray-800/50 overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Import/Export Theme</h3>
                    <button
                      onClick={handleExport}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste theme JSON data here..."
                      className="flex-1 h-24 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 text-sm resize-none"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!importData.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'appearance', label: 'Appearance', icon: Monitor },
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'layout', label: 'Layout', icon: Sliders },
              { id: 'presets', label: 'Presets', icon: Check }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Theme Mode</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { mode: 'light' as ThemeMode, icon: Sun, label: 'Light' },
                      { mode: 'dark' as ThemeMode, icon: Moon, label: 'Dark' },
                      { mode: 'system' as ThemeMode, icon: Monitor, label: 'System' }
                    ].map(({ mode, icon: Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => handleModeChange(mode)}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all ${
                          config.mode === mode
                            ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                            : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Font Size</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { size: 'small' as const, label: 'Small', preview: '14px' },
                      { size: 'medium' as const, label: 'Medium', preview: '16px' },
                      { size: 'large' as const, label: 'Large', preview: '18px' }
                    ].map(({ size, label, preview }) => (
                      <button
                        key={size}
                        onClick={() => handleFontSizeChange(size)}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all ${
                          config.fontSize === size
                            ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                            : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Type className="w-6 h-6" />
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-gray-500">{preview}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Color Scheme</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => handleColorSchemeChange(scheme.id)}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all ${
                          config.colorScheme === scheme.id
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: scheme.color }}
                        />
                        <span className="text-white font-medium text-sm">{scheme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Transparency: {config.transparency}%
                  </h3>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={config.transparency}
                    onChange={(e) => handleTransparencyChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>More Transparent</span>
                    <span>More Opaque</span>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <h3 className="text-white font-semibold">Compact Mode</h3>
                    <p className="text-gray-400 text-sm">Reduce spacing for more content</p>
                  </div>
                  <button
                    onClick={themeService.toggleCompactMode}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      config.compactMode ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        config.compactMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <h3 className="text-white font-semibold">Animations</h3>
                    <p className="text-gray-400 text-sm">Enable smooth transitions and effects</p>
                  </div>
                  <button
                    onClick={themeService.toggleAnimations}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      config.animations ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        config.animations ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Theme Presets</h3>
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-1">
                        {preset.preview.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{preset.name}</h4>
                        <p className="text-gray-400 text-sm">{preset.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePresetApply(preset.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeCustomizer;