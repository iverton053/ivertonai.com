import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Eye,
  Save,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Check,
  X,
  Image,
  Type,
  Layout,
  Sliders
} from 'lucide-react';
import { ClientPortal } from '../../types/clientPortal';
import { clientPortalService } from '../../services/clientPortalService';

interface ThemeEditorProps {
  portal: ClientPortal;
  onSave: (theme: any) => void;
  onClose: () => void;
}

interface ColorPalette {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  text_primary: string;
  text_secondary: string;
  background_light: string;
  background_dark: string;
}

interface ThemeConfig {
  colors: ColorPalette;
  typography: {
    font_family: string;
    heading_font: string;
    font_sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  layout: {
    border_radius: string;
    spacing: string;
    shadow_level: string;
  };
  background: {
    type: 'solid' | 'gradient' | 'image';
    value: string;
    opacity: number;
  };
  sidebar: {
    style: 'light' | 'dark' | 'colored' | 'glass';
    position: 'left' | 'right';
    width: string;
  };
}

const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#06b6d4',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    error_color: '#ef4444',
    text_primary: '#111827',
    text_secondary: '#6b7280',
    background_light: '#ffffff',
    background_dark: '#1f2937'
  },
  typography: {
    font_family: 'Inter',
    heading_font: 'Inter',
    font_sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px'
    }
  },
  layout: {
    border_radius: '8px',
    spacing: '1rem',
    shadow_level: 'medium'
  },
  background: {
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 1
  },
  sidebar: {
    style: 'dark',
    position: 'left',
    width: '256px'
  }
};

const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Nunito',
  'Poppins',
  'Source Sans Pro',
  'Fira Sans',
  'Ubuntu'
];

const PRESET_THEMES = {
  corporate: {
    name: 'Corporate Blue',
    colors: {
      primary_color: '#1e40af',
      secondary_color: '#3b82f6',
      accent_color: '#06b6d4'
    }
  },
  creative: {
    name: 'Creative Purple',
    colors: {
      primary_color: '#7c3aed',
      secondary_color: '#a855f7',
      accent_color: '#ec4899'
    }
  },
  nature: {
    name: 'Nature Green',
    colors: {
      primary_color: '#059669',
      secondary_color: '#10b981',
      accent_color: '#34d399'
    }
  },
  sunset: {
    name: 'Sunset Orange',
    colors: {
      primary_color: '#ea580c',
      secondary_color: '#f97316',
      accent_color: '#fb923c'
    }
  }
};

const ThemeEditor: React.FC<ThemeEditorProps> = ({ portal, onSave, onClose }) => {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'background'>('colors');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [darkMode, setDarkMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize theme from portal configuration
    if (portal.theme) {
      const portalTheme: ThemeConfig = {
        colors: {
          primary_color: portal.theme.primary_color || DEFAULT_THEME.colors.primary_color,
          secondary_color: portal.theme.secondary_color || DEFAULT_THEME.colors.secondary_color,
          accent_color: portal.theme.accent_color || DEFAULT_THEME.colors.accent_color,
          success_color: DEFAULT_THEME.colors.success_color,
          warning_color: DEFAULT_THEME.colors.warning_color,
          error_color: DEFAULT_THEME.colors.error_color,
          text_primary: DEFAULT_THEME.colors.text_primary,
          text_secondary: DEFAULT_THEME.colors.text_secondary,
          background_light: DEFAULT_THEME.colors.background_light,
          background_dark: DEFAULT_THEME.colors.background_dark
        },
        typography: {
          font_family: portal.theme.font_family || DEFAULT_THEME.typography.font_family,
          heading_font: DEFAULT_THEME.typography.heading_font,
          font_sizes: DEFAULT_THEME.typography.font_sizes
        },
        layout: {
          border_radius: DEFAULT_THEME.layout.border_radius,
          spacing: DEFAULT_THEME.layout.spacing,
          shadow_level: DEFAULT_THEME.layout.shadow_level
        },
        background: {
          type: portal.theme.background_type || DEFAULT_THEME.background.type,
          value: portal.theme.background_value || DEFAULT_THEME.background.value,
          opacity: 1
        },
        sidebar: {
          style: portal.theme.sidebar_style || DEFAULT_THEME.sidebar.style,
          position: 'left',
          width: '256px'
        }
      };
      setTheme(portalTheme);
    }
  }, [portal.theme]);

  const updateTheme = (path: string, value: any) => {
    setTheme(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
    setHasChanges(true);
  };

  const applyPresetTheme = (presetKey: string) => {
    const preset = PRESET_THEMES[presetKey as keyof typeof PRESET_THEMES];
    if (preset) {
      updateTheme('colors.primary_color', preset.colors.primary_color);
      updateTheme('colors.secondary_color', preset.colors.secondary_color);
      updateTheme('colors.accent_color', preset.colors.accent_color);
    }
  };

  const generateColorPalette = (baseColor: string) => {
    // Simple color palette generation (in production, use a proper color library)
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Generate secondary color (lighter)
    const secondary = `#${Math.min(255, r + 30).toString(16).padStart(2, '0')}${Math.min(255, g + 30).toString(16).padStart(2, '0')}${Math.min(255, b + 30).toString(16).padStart(2, '0')}`;

    // Generate accent color (different hue)
    const accent = `#${Math.min(255, Math.max(0, r + 50)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, g - 20)).toString(16).padStart(2, '0')}${Math.min(255, Math.max(0, b + 40)).toString(16).padStart(2, '0')}`;

    updateTheme('colors.secondary_color', secondary);
    updateTheme('colors.accent_color', accent);
  };

  const copyColorToClipboard = async (color: string, name: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(name);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portal.branding.company_name || 'portal'}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string);
          setTheme(importedTheme);
          setHasChanges(true);
        } catch (error) {
          alert('Invalid theme file');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    setHasChanges(true);
  };

  const saveTheme = async () => {
    try {
      // Convert theme to portal theme format
      const portalTheme = {
        primary_color: theme.colors.primary_color,
        secondary_color: theme.colors.secondary_color,
        accent_color: theme.colors.accent_color,
        background_type: theme.background.type,
        background_value: theme.background.value,
        font_family: theme.typography.font_family,
        layout_style: 'modern',
        sidebar_style: theme.sidebar.style
      };

      await clientPortalService.updatePortalConfiguration(portal.id, {
        theme: portalTheme
      });

      onSave(portalTheme);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme');
    }
  };

  const ColorPicker: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    name: string;
  }> = ({ label, value, onChange, name }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        <button
          onClick={() => copyColorToClipboard(value, name)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {copied === name ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const getPreviewStyles = () => ({
    '--primary-color': theme.colors.primary_color,
    '--secondary-color': theme.colors.secondary_color,
    '--accent-color': theme.colors.accent_color,
    '--font-family': theme.typography.font_family,
    background: theme.background.type === 'solid'
      ? theme.background.value
      : theme.background.type === 'gradient'
      ? theme.background.value
      : `url(${theme.background.value})`,
    borderRadius: theme.layout.border_radius
  } as React.CSSProperties);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden"
      >
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Theme Editor</h2>
                  <p className="text-sm text-gray-500">Customize your portal appearance</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-800 text-yellow-400' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'layout', label: 'Layout', icon: Layout },
              { id: 'background', label: 'Background', icon: Image }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="block">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'colors' && (
                <motion.div
                  key="colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Preset Themes */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(PRESET_THEMES).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => applyPresetTheme(key)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex space-x-1 mb-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.colors.primary_color }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.colors.secondary_color }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.colors.accent_color }}
                            />
                          </div>
                          <p className="text-xs font-medium text-gray-700">{preset.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Pickers */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Brand Colors</h3>

                    <ColorPicker
                      label="Primary Color"
                      value={theme.colors.primary_color}
                      onChange={(value) => {
                        updateTheme('colors.primary_color', value);
                        generateColorPalette(value);
                      }}
                      name="primary"
                    />

                    <ColorPicker
                      label="Secondary Color"
                      value={theme.colors.secondary_color}
                      onChange={(value) => updateTheme('colors.secondary_color', value)}
                      name="secondary"
                    />

                    <ColorPicker
                      label="Accent Color"
                      value={theme.colors.accent_color}
                      onChange={(value) => updateTheme('colors.accent_color', value)}
                      name="accent"
                    />
                  </div>

                  {/* Status Colors */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Status Colors</h3>

                    <ColorPicker
                      label="Success"
                      value={theme.colors.success_color}
                      onChange={(value) => updateTheme('colors.success_color', value)}
                      name="success"
                    />

                    <ColorPicker
                      label="Warning"
                      value={theme.colors.warning_color}
                      onChange={(value) => updateTheme('colors.warning_color', value)}
                      name="warning"
                    />

                    <ColorPicker
                      label="Error"
                      value={theme.colors.error_color}
                      onChange={(value) => updateTheme('colors.error_color', value)}
                      name="error"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'typography' && (
                <motion.div
                  key="typography"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      value={theme.typography.font_family}
                      onChange={(e) => updateTheme('typography.font_family', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size Preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Font Sizes</h3>
                    <div className="space-y-3">
                      {Object.entries(theme.typography.font_sizes).map(([size, value]) => (
                        <div key={size} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{size}</span>
                          <div
                            className="text-gray-900"
                            style={{
                              fontSize: value,
                              fontFamily: theme.typography.font_family
                            }}
                          >
                            Sample Text
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Radius
                    </label>
                    <select
                      value={theme.layout.border_radius}
                      onChange={(e) => updateTheme('layout.border_radius', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="0px">None (0px)</option>
                      <option value="4px">Small (4px)</option>
                      <option value="8px">Medium (8px)</option>
                      <option value="12px">Large (12px)</option>
                      <option value="16px">Extra Large (16px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shadow Level
                    </label>
                    <select
                      value={theme.layout.shadow_level}
                      onChange={(e) => updateTheme('layout.shadow_level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">No Shadow</option>
                      <option value="light">Light Shadow</option>
                      <option value="medium">Medium Shadow</option>
                      <option value="heavy">Heavy Shadow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sidebar Style
                    </label>
                    <select
                      value={theme.sidebar.style}
                      onChange={(e) => updateTheme('sidebar.style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="colored">Colored</option>
                      <option value="glass">Glass</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'background' && (
                <motion.div
                  key="background"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['solid', 'gradient', 'image'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateTheme('background.type', type)}
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            theme.background.type === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {theme.background.type === 'solid' && (
                    <ColorPicker
                      label="Background Color"
                      value={theme.background.value}
                      onChange={(value) => updateTheme('background.value', value)}
                      name="background"
                    />
                  )}

                  {theme.background.type === 'gradient' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gradient CSS
                      </label>
                      <textarea
                        value={theme.background.value}
                        onChange={(e) => updateTheme('background.value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        rows={3}
                        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      />
                    </div>
                  )}

                  {theme.background.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={theme.background.value}
                        onChange={(e) => updateTheme('background.value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={exportTheme}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
              </label>
              <button
                onClick={resetTheme}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTheme}
                disabled={!hasChanges}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Theme</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div className="p-6">
            <div
              className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all ${
                previewMode === 'mobile'
                  ? 'max-w-sm mx-auto'
                  : previewMode === 'tablet'
                  ? 'max-w-2xl mx-auto'
                  : 'w-full'
              }`}
              style={getPreviewStyles()}
            >
              {/* Preview Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary_color }}
                    >
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: theme.typography.font_family }}>
                        Portal Preview
                      </h3>
                      <p className="text-sm text-gray-500">Theme: Live Preview</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 text-sm rounded"
                      style={{
                        backgroundColor: theme.colors.secondary_color,
                        color: 'white'
                      }}
                    >
                      Secondary
                    </button>
                    <button
                      className="px-3 py-1 text-sm rounded"
                      style={{
                        backgroundColor: theme.colors.accent_color,
                        color: 'white'
                      }}
                    >
                      Accent
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h1
                    className="text-2xl font-bold mb-2"
                    style={{
                      fontFamily: theme.typography.font_family,
                      color: theme.colors.text_primary
                    }}
                  >
                    Welcome to Your Portal
                  </h1>
                  <p style={{ color: theme.colors.text_secondary }}>
                    This is a preview of how your theme will look in the actual portal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Primary', 'Secondary', 'Accent'].map((color, index) => (
                    <div
                      key={color}
                      className="p-4 rounded-lg text-white text-center"
                      style={{
                        backgroundColor: index === 0
                          ? theme.colors.primary_color
                          : index === 1
                          ? theme.colors.secondary_color
                          : theme.colors.accent_color,
                        borderRadius: theme.layout.border_radius
                      }}
                    >
                      <h3 className="font-semibold">{color}</h3>
                      <p className="text-sm opacity-90">Sample widget</p>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.success_color }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.warning_color }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.error_color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeEditor;