import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Upload, Globe, Eye } from 'lucide-react';
import { OnboardingStepProps } from '../../types/onboarding';

const BRAND_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6',
  '#8B5A2B', '#6B7280', '#1F2937', '#7C3AED', '#DC2626'
];

const LOGO_POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center', label: 'Center' }
];

const BRAND_STYLES = [
  { value: 'modern', label: 'Modern & Clean', description: 'Minimalist, contemporary design' },
  { value: 'professional', label: 'Professional', description: 'Corporate, business-focused' },
  { value: 'creative', label: 'Creative & Bold', description: 'Artistic, vibrant design' },
  { value: 'elegant', label: 'Elegant & Sophisticated', description: 'Refined, luxury feel' },
  { value: 'friendly', label: 'Friendly & Approachable', description: 'Warm, inviting design' },
  { value: 'tech', label: 'Tech & Innovation', description: 'Cutting-edge, futuristic' }
];

const BrandingStep: React.FC<OnboardingStepProps> = ({
  formData,
  onUpdate,
  onNext
}) => {
  const [localData, setLocalData] = useState({
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    accentColor: '#10B981',
    logoUrl: '',
    logoPosition: 'top-left',
    brandStyle: 'modern',
    customDomain: '',
    companyName: formData.basicInfo?.company || '',
    brandGuidelines: '',
    fontPreference: 'system',
    colorScheme: 'professional',
    brandingNotes: '',
    socialMediaBranding: {
      useConsistentColors: true,
      includeLogo: true,
      brandedTemplates: true
    },
    reportBranding: {
      useClientColors: true,
      includeClientLogo: true,
      whiteLabel: false
    },
    ...formData.branding
  });

  const [colorPreview, setColorPreview] = useState(false);

  useEffect(() => {
    onUpdate('branding', localData);
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

  const handleColorSelect = (colorType: string, color: string) => {
    handleInputChange(colorType, color);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload this to a server
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      handleInputChange('logoUrl', url);
    }
  };

  const FONT_OPTIONS = [
    { value: 'system', label: 'System Default' },
    { value: 'arial', label: 'Arial' },
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'georgia', label: 'Georgia' },
    { value: 'times', label: 'Times New Roman' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'open-sans', label: 'Open Sans' },
    { value: 'montserrat', label: 'Montserrat' }
  ];

  const COLOR_SCHEMES = [
    { value: 'professional', label: 'Professional', colors: ['#1F2937', '#374151', '#6B7280'] },
    { value: 'vibrant', label: 'Vibrant', colors: ['#EF4444', '#F59E0B', '#10B981'] },
    { value: 'cool', label: 'Cool Tones', colors: ['#3B82F6', '#6366F1', '#8B5CF6'] },
    { value: 'warm', label: 'Warm Tones', colors: ['#F59E0B', '#F97316', '#DC2626'] },
    { value: 'nature', label: 'Nature', colors: ['#10B981', '#84CC16', '#059669'] }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Palette className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Branding & Visual Identity</h3>
        <p className="text-gray-400 mb-6">
          Customize the visual appearance of your dashboard and reports
        </p>
      </motion.div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Company Name (for branding)
        </label>
        <input
          type="text"
          value={localData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          placeholder="Enter company name"
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Company Logo
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/30 hover:bg-gray-700/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, SVG (MAX. 2MB)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {localData.logoUrl && (
            <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center">
              <img
                src={localData.logoUrl}
                alt="Company Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Logo Position */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Logo Position in Dashboard
        </label>
        <select
          value={localData.logoPosition}
          onChange={(e) => handleInputChange('logoPosition', e.target.value)}
          className="w-full md:w-1/2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          {LOGO_POSITIONS.map(position => (
            <option key={position.value} value={position.value}>
              {position.label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Colors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-white">
            Brand Colors
          </label>
          <button
            onClick={() => setColorPreview(!colorPreview)}
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>{colorPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Primary Color</label>
            <div className="space-y-2">
              <input
                type="color"
                value={localData.primaryColor}
                onChange={(e) => handleColorSelect('primaryColor', e.target.value)}
                className="w-full h-12 rounded border border-gray-600"
              />
              <div className="grid grid-cols-5 gap-1">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect('primaryColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded border-2 ${
                      localData.primaryColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Secondary Color</label>
            <div className="space-y-2">
              <input
                type="color"
                value={localData.secondaryColor}
                onChange={(e) => handleColorSelect('secondaryColor', e.target.value)}
                className="w-full h-12 rounded border border-gray-600"
              />
              <div className="grid grid-cols-5 gap-1">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect('secondaryColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded border-2 ${
                      localData.secondaryColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Accent Color</label>
            <div className="space-y-2">
              <input
                type="color"
                value={localData.accentColor}
                onChange={(e) => handleColorSelect('accentColor', e.target.value)}
                className="w-full h-12 rounded border border-gray-600"
              />
              <div className="grid grid-cols-5 gap-1">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect('accentColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded border-2 ${
                      localData.accentColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        {colorPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600"
          >
            <h5 className="text-white font-medium mb-3">Color Preview</h5>
            <div className="flex space-x-4">
              <div
                style={{ backgroundColor: localData.primaryColor }}
                className="flex-1 h-16 rounded flex items-center justify-center text-white font-medium"
              >
                Primary
              </div>
              <div
                style={{ backgroundColor: localData.secondaryColor }}
                className="flex-1 h-16 rounded flex items-center justify-center text-white font-medium"
              >
                Secondary
              </div>
              <div
                style={{ backgroundColor: localData.accentColor }}
                className="flex-1 h-16 rounded flex items-center justify-center text-white font-medium"
              >
                Accent
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Brand Style */}
      <div>
        <label className="block text-sm font-medium text-white mb-4">
          Brand Style
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRAND_STYLES.map((style) => (
            <motion.label
              key={style.value}
              whileHover={{ scale: 1.02 }}
              className={`
                flex flex-col p-4 rounded-lg cursor-pointer transition-all duration-200 border
                ${localData.brandStyle === style.value
                  ? 'bg-purple-600/20 border-purple-400 text-white'
                  : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              <input
                type="radio"
                name="brandStyle"
                value={style.value}
                checked={localData.brandStyle === style.value}
                onChange={(e) => handleInputChange('brandStyle', e.target.value)}
                className="sr-only"
              />
              <span className="font-medium mb-1">{style.label}</span>
              <span className="text-sm opacity-80">{style.description}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Font Preference */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Font Preference
        </label>
        <select
          value={localData.fontPreference}
          onChange={(e) => handleInputChange('fontPreference', e.target.value)}
          className="w-full md:w-1/2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          {FONT_OPTIONS.map(font => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Domain */}
      <div>
        <label className="block text-sm font-medium text-white mb-2 flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span>Custom Domain (optional)</span>
        </label>
        <input
          type="text"
          value={localData.customDomain}
          onChange={(e) => handleInputChange('customDomain', e.target.value)}
          placeholder="dashboard.yourcompany.com"
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
        <p className="text-sm text-gray-400 mt-1">
          Use your own domain for client dashboard access
        </p>
      </div>

      {/* Social Media Branding */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Social Media Branding</h4>
        <div className="space-y-3">
          {[
            { key: 'useConsistentColors', label: 'Use Consistent Brand Colors', description: 'Apply brand colors to social media templates' },
            { key: 'includeLogo', label: 'Include Logo in Posts', description: 'Automatically add logo to generated content' },
            { key: 'brandedTemplates', label: 'Branded Templates', description: 'Use custom templates with brand styling' }
          ].map((setting) => (
            <label
              key={setting.key}
              className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.socialMediaBranding[setting.key as keyof typeof localData.socialMediaBranding]}
                onChange={(e) => handleInputChange(`socialMediaBranding.${setting.key}`, e.target.checked)}
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

      {/* Report Branding */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Report Branding</h4>
        <div className="space-y-3">
          {[
            { key: 'useClientColors', label: 'Use Client Brand Colors', description: 'Apply brand colors to charts and reports' },
            { key: 'includeClientLogo', label: 'Include Client Logo', description: 'Add client logo to report headers' },
            { key: 'whiteLabel', label: 'White Label Reports', description: 'Remove agency branding from client reports' }
          ].map((setting) => (
            <label
              key={setting.key}
              className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localData.reportBranding[setting.key as keyof typeof localData.reportBranding]}
                onChange={(e) => handleInputChange(`reportBranding.${setting.key}`, e.target.checked)}
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

      {/* Brand Guidelines */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Brand Guidelines & Notes
        </label>
        <textarea
          value={localData.brandGuidelines}
          onChange={(e) => handleInputChange('brandGuidelines', e.target.value)}
          placeholder="Any specific brand guidelines, dos and don'ts, or special requirements..."
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
        Complete Setup
      </motion.button>
    </div>
  );
};

export default BrandingStep;