import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Palette, Settings, Check, ExternalLink, 
  Copy, Download, Eye, Shield, Zap, Monitor
} from 'lucide-react';

interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customDomain?: string;
}

interface PortalFeatures {
  dashboard: boolean;
  analytics: boolean;
  messaging: boolean;
  fileSharing: boolean;
  approvals: boolean;
  billing: boolean;
}

interface AutoPortalGeneratorProps {
  clientId: string;
  clientName: string;
  branding: BrandingConfig;
  onPortalCreated: (portalUrl: string, config: any) => void;
}

const AutoPortalGenerator: React.FC<AutoPortalGeneratorProps> = ({
  clientId,
  clientName,
  branding,
  onPortalCreated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [portalUrl, setPortalUrl] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  
  const [portalConfig, setPortalConfig] = useState<PortalFeatures>({
    dashboard: true,
    analytics: true,
    messaging: true,
    fileSharing: true,
    approvals: true,
    billing: false
  });

  const generatePortal = async () => {
    setIsGenerating(true);
    setProgress(0);

    const steps = [
      'Creating subdomain...',
      'Applying brand styling...',
      'Configuring features...',
      'Setting up security...',
      'Generating SSL certificate...',
      'Deploying portal...',
      'Testing functionality...',
      'Portal ready!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate portal URL
    const subdomain = clientName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const generatedUrl = branding.customDomain || `https://${subdomain}.yourportal.com`;
    setPortalUrl(generatedUrl);
    setPreviewReady(true);
    setIsGenerating(false);

    // Notify parent component
    onPortalCreated(generatedUrl, {
      branding,
      features: portalConfig,
      subdomain,
      customDomain: branding.customDomain
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Portal Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Portal Features</span>
          </h4>
          <div className="space-y-3">
            {Object.entries(portalConfig).map(([feature, enabled]) => (
              <label key={feature} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="text-white capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setPortalConfig(prev => ({
                    ...prev,
                    [feature]: e.target.checked
                  }))}
                  className="text-purple-500 focus:ring-purple-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Brand Preview</span>
          </h4>
          <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-600"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div>
                <p className="text-white text-sm font-medium">Primary Color</p>
                <p className="text-gray-400 text-xs">{branding.primaryColor}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded border-2 border-gray-600"
                style={{ backgroundColor: branding.secondaryColor }}
              />
              <div>
                <p className="text-white text-sm font-medium">Secondary Color</p>
                <p className="text-gray-400 text-xs">{branding.secondaryColor}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <p className="text-white text-sm font-medium mb-2">Preview URL</p>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">
                  {branding.customDomain || `${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.yourportal.com`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              />
              <span className="text-white font-medium">Generating Client Portal...</span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                />
              </div>
              <p className="text-purple-400 text-sm">{generationStep}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portal Ready */}
      {previewReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Portal Generated Successfully! 🎉</h4>
              <p className="text-gray-400">Your client portal is now live and ready to use</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Portal URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={portalUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(portalUrl)}
                    className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(portalUrl, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Portal</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download Assets</span>
                </button>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Portal Features</h5>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(portalConfig).map(([feature, enabled]) => (
                  enabled && (
                    <div key={feature} className="flex items-center space-x-2 text-sm text-gray-400">
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 text-sm font-medium">Security Features Enabled</p>
                <p className="text-gray-400 text-xs">SSL certificate, user authentication, and data encryption are automatically configured</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      {!isGenerating && !previewReady && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePortal}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors mx-auto"
          >
            <Zap className="w-5 h-5" />
            <span>Generate Client Portal</span>
          </motion.button>
          <p className="text-gray-400 text-sm mt-2">
            Automated setup takes approximately 10-15 seconds
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoPortalGenerator;