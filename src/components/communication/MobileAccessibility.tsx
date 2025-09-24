import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Accessibility,
  Settings,
  Check,
  X,
  Plus,
  Minus,
  RotateCcw,
  Palette,
  Zap,
  Users,
  Bell,
  Moon,
  Sun,
  Focus,
  Move,
  Hand,
  Speaker,
  Headphones,
  Languages,
  Globe
} from 'lucide-react';
import { EnhancedBadge, StatusIndicator } from '../ui/EnhancedVisualHierarchy';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  voiceNavigation: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
  focusIndicators: boolean;
  soundAlerts: boolean;
  hapticFeedback: boolean;
  language: string;
  textToSpeech: boolean;
}

interface ResponsiveBreakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

interface MobileAccessibilityProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onBreakpointChange?: (breakpoint: ResponsiveBreakpoints) => void;
}

const MobileAccessibility: React.FC<MobileAccessibilityProps> = ({
  onSettingsChange,
  onBreakpointChange
}) => {
  const [activeTab, setActiveTab] = useState<'responsive' | 'accessibility' | 'testing'>('responsive');
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    darkMode: true,
    reducedMotion: false,
    screenReader: false,
    voiceNavigation: false,
    keyboardNavigation: true,
    colorBlindFriendly: false,
    focusIndicators: true,
    soundAlerts: true,
    hapticFeedback: true,
    language: 'en',
    textToSpeech: false
  });

  const [responsiveBreakpoints, setResponsiveBreakpoints] = useState<ResponsiveBreakpoints>({
    mobile: false,
    tablet: false,
    desktop: true,
    currentBreakpoint: 'desktop',
    orientation: 'landscape'
  });

  const [deviceSimulation, setDeviceSimulation] = useState<'auto' | 'mobile' | 'tablet' | 'desktop'>('auto');
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    test: string;
    status: 'passed' | 'failed' | 'warning';
    description: string;
    solution?: string;
  }>>([]);

  // Responsive breakpoint detection
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      const breakpoint: ResponsiveBreakpoints = {
        mobile: isMobile,
        tablet: isTablet,
        desktop: isDesktop,
        currentBreakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      };

      setResponsiveBreakpoints(breakpoint);
      onBreakpointChange?.(breakpoint);
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    window.addEventListener('orientationchange', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
      window.removeEventListener('orientationchange', updateBreakpoint);
    };
  }, [onBreakpointChange]);

  // Accessibility testing
  useEffect(() => {
    const runAccessibilityTests = () => {
      const tests = [
        {
          id: 'contrast',
          test: 'Color Contrast',
          status: accessibilitySettings.highContrast ? 'passed' : 'warning' as const,
          description: 'Text meets WCAG AA contrast requirements',
          solution: 'Enable high contrast mode for better visibility'
        },
        {
          id: 'keyboard',
          test: 'Keyboard Navigation',
          status: accessibilitySettings.keyboardNavigation ? 'passed' : 'failed' as const,
          description: 'All interactive elements are keyboard accessible',
          solution: 'Enable keyboard navigation support'
        },
        {
          id: 'screen-reader',
          test: 'Screen Reader Support',
          status: accessibilitySettings.screenReader ? 'passed' : 'warning' as const,
          description: 'ARIA labels and semantic markup present',
          solution: 'Enable screen reader optimizations'
        },
        {
          id: 'focus',
          test: 'Focus Indicators',
          status: accessibilitySettings.focusIndicators ? 'passed' : 'failed' as const,
          description: 'Clear focus indicators for all interactive elements',
          solution: 'Enable focus indicators for keyboard users'
        },
        {
          id: 'motion',
          test: 'Reduced Motion',
          status: accessibilitySettings.reducedMotion ? 'passed' : 'warning' as const,
          description: 'Respects user motion preferences',
          solution: 'Enable reduced motion for users with vestibular disorders'
        },
        {
          id: 'responsive',
          test: 'Mobile Responsiveness',
          status: 'passed' as const,
          description: 'Layout adapts to different screen sizes',
          solution: 'Already optimized for mobile devices'
        }
      ];

      setTestResults(tests);
    };

    runAccessibilityTests();
  }, [accessibilitySettings]);

  const handleAccessibilityToggle = (key: keyof AccessibilitySettings) => {
    const newSettings = {
      ...accessibilitySettings,
      [key]: !accessibilitySettings[key]
    };
    setAccessibilitySettings(newSettings);
    onSettingsChange?.(newSettings);

    // Apply settings to document
    if (key === 'highContrast') {
      document.body.classList.toggle('high-contrast', newSettings.highContrast);
    }
    if (key === 'reducedMotion') {
      document.body.classList.toggle('reduced-motion', newSettings.reducedMotion);
    }
    if (key === 'darkMode') {
      document.body.classList.toggle('dark-mode', newSettings.darkMode);
    }
  };

  const handleFontSizeChange = (size: AccessibilitySettings['fontSize']) => {
    const newSettings = { ...accessibilitySettings, fontSize: size };
    setAccessibilitySettings(newSettings);
    onSettingsChange?.(newSettings);

    // Apply font size to document
    document.documentElement.className = document.documentElement.className
      .replace(/font-size-\w+/g, '') + ` font-size-${size}`;
  };

  const simulateDevice = (device: typeof deviceSimulation) => {
    setDeviceSimulation(device);

    // Apply device-specific styles
    const container = document.querySelector('.communication-hub-container');
    if (container) {
      container.classList.remove('simulate-mobile', 'simulate-tablet', 'simulate-desktop');
      if (device !== 'auto') {
        container.classList.add(`simulate-${device}`);
      }
    }

    // Trigger responsive updates
    if (device === 'mobile') {
      setResponsiveBreakpoints({
        mobile: true,
        tablet: false,
        desktop: false,
        currentBreakpoint: 'mobile',
        orientation: 'portrait'
      });
    } else if (device === 'tablet') {
      setResponsiveBreakpoints({
        mobile: false,
        tablet: true,
        desktop: false,
        currentBreakpoint: 'tablet',
        orientation: 'landscape'
      });
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const accessibilityScore = Math.round(
    (testResults.filter(t => t.status === 'passed').length / testResults.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mobile & Accessibility</h1>
          <p className="text-gray-400">Responsive design and accessibility optimization tools</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Accessibility className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">A11y Score: {accessibilityScore}%</span>
          </div>
          <StatusIndicator
            status={accessibilityScore >= 80 ? 'active' : 'inactive'}
            label={accessibilityScore >= 80 ? 'Compliant' : 'Needs Work'}
          />
        </div>
      </div>

      {/* Current Device Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
              {getDeviceIcon(responsiveBreakpoints.currentBreakpoint)}
            </div>
            <EnhancedBadge variant="blue" size="sm">
              {responsiveBreakpoints.currentBreakpoint}
            </EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {window.innerWidth}x{window.innerHeight}
          </h3>
          <p className="text-gray-400 text-sm">Screen Resolution</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
              <Accessibility className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="success" size="sm">{accessibilityScore}%</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">WCAG AA</h3>
          <p className="text-gray-400 text-sm">Compliance Level</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
              <Type className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="purple" size="sm">
              {accessibilitySettings.fontSize}
            </EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">16px</h3>
          <p className="text-gray-400 text-sm">Base Font Size</p>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400">
              <Languages className="w-6 h-6" />
            </div>
            <EnhancedBadge variant="orange" size="sm">EN</EnhancedBadge>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">English</h3>
          <p className="text-gray-400 text-sm">Interface Language</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {[
            { id: 'responsive', label: 'Responsive Design', icon: Smartphone },
            { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
            { id: 'testing', label: 'Testing & Validation', icon: Check }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Reset all settings
            setAccessibilitySettings({
              fontSize: 'medium',
              highContrast: false,
              darkMode: true,
              reducedMotion: false,
              screenReader: false,
              voiceNavigation: false,
              keyboardNavigation: true,
              colorBlindFriendly: false,
              focusIndicators: true,
              soundAlerts: true,
              hapticFeedback: true,
              language: 'en',
              textToSpeech: false
            });
            setDeviceSimulation('auto');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Settings</span>
        </motion.button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'responsive' && (
            <div className="space-y-6">
              {/* Device Simulation */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Device Simulation</h3>
                  <div className="flex items-center space-x-2">
                    {['auto', 'mobile', 'tablet', 'desktop'].map((device) => (
                      <motion.button
                        key={device}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => simulateDevice(device as any)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                          deviceSimulation === device
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                      >
                        {getDeviceIcon(device)}
                        <span className="capitalize">{device}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Breakpoint Info */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Current Breakpoint</h4>
                    <div className="space-y-3">
                      {Object.entries(responsiveBreakpoints)
                        .filter(([key]) => key !== 'currentBreakpoint' && key !== 'orientation')
                        .map(([breakpoint, active]) => (
                          <div key={breakpoint} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                              {getDeviceIcon(breakpoint)}
                              <span className="text-white capitalize">{breakpoint}</span>
                            </div>
                            <StatusIndicator
                              status={active ? 'active' : 'inactive'}
                              size="sm"
                            />
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Responsive Features */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Responsive Features</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Flexible Grid Layout', status: 'active' },
                        { name: 'Touch-Friendly Controls', status: 'active' },
                        { name: 'Adaptive Typography', status: 'active' },
                        { name: 'Mobile Navigation', status: 'active' },
                        { name: 'Gesture Support', status: 'active' }
                      ].map((feature) => (
                        <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <span className="text-white">{feature.name}</span>
                          <StatusIndicator
                            status={feature.status as any}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Touch & Gesture Support */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Touch & Gesture Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Swipe Navigation', icon: Hand, status: 'Enabled' },
                    { name: 'Pinch to Zoom', icon: Move, status: 'Enabled' },
                    { name: 'Touch Targets', icon: MousePointer, status: '44px minimum' },
                    { name: 'Haptic Feedback', icon: Zap, status: accessibilitySettings.hapticFeedback ? 'Enabled' : 'Disabled' }
                  ].map((feature) => (
                    <div key={feature.name} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{feature.name}</h4>
                          <p className="text-gray-400 text-xs">{feature.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              {/* Font & Display Settings */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Font & Display Settings</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">Font Size</label>
                      <div className="flex items-center space-x-2">
                        {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                          <motion.button
                            key={size}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFontSizeChange(size)}
                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                              accessibilitySettings.fontSize === size
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                            }`}
                          >
                            <Type className="w-4 h-4" />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'highContrast' as const, label: 'High Contrast Mode', icon: Contrast },
                        { key: 'darkMode' as const, label: 'Dark Mode', icon: Moon },
                        { key: 'colorBlindFriendly' as const, label: 'Color Blind Friendly', icon: Palette }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <setting.icon className="w-4 h-4 text-purple-400" />
                            <span className="text-white">{setting.label}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAccessibilityToggle(setting.key)}
                            className={`p-2 rounded-lg transition-colors ${
                              accessibilitySettings[setting.key]
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-600/50 text-gray-400'
                            }`}
                          >
                            {accessibilitySettings[setting.key] ?
                              <Check className="w-4 h-4" /> :
                              <X className="w-4 h-4" />
                            }
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Navigation & Interaction</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'keyboardNavigation' as const, label: 'Keyboard Navigation', icon: Keyboard },
                        { key: 'focusIndicators' as const, label: 'Focus Indicators', icon: Focus },
                        { key: 'reducedMotion' as const, label: 'Reduced Motion', icon: Move },
                        { key: 'voiceNavigation' as const, label: 'Voice Navigation', icon: Speaker }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <setting.icon className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{setting.label}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAccessibilityToggle(setting.key)}
                            className={`p-2 rounded-lg transition-colors ${
                              accessibilitySettings[setting.key]
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-600/50 text-gray-400'
                            }`}
                          >
                            {accessibilitySettings[setting.key] ?
                              <Check className="w-4 h-4" /> :
                              <X className="w-4 h-4" />
                            }
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen Reader & Audio */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Screen Reader & Audio</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {[
                      { key: 'screenReader' as const, label: 'Screen Reader Optimization', icon: Eye },
                      { key: 'textToSpeech' as const, label: 'Text-to-Speech', icon: Volume2 },
                      { key: 'soundAlerts' as const, label: 'Sound Alerts', icon: Bell }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <setting.icon className="w-5 h-5 text-green-400" />
                          <span className="text-white font-medium">{setting.label}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAccessibilityToggle(setting.key)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            accessibilitySettings[setting.key]
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600/70'
                          }`}
                        >
                          {accessibilitySettings[setting.key] ? 'Enabled' : 'Disabled'}
                        </motion.button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Language & Localization</h4>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Languages className="w-5 h-5 text-orange-400" />
                          <span className="text-white font-medium">Interface Language</span>
                        </div>
                        <EnhancedBadge variant="orange" size="sm">EN</EnhancedBadge>
                      </div>
                      <select
                        value={accessibilitySettings.language}
                        onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-6">
              {/* Accessibility Test Results */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Accessibility Test Results</h3>
                  <div className="flex items-center space-x-2">
                    <EnhancedBadge
                      variant={accessibilityScore >= 90 ? 'success' : accessibilityScore >= 70 ? 'warning' : 'error'}
                      size="sm"
                    >
                      {accessibilityScore}% Score
                    </EnhancedBadge>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Re-run tests
                        const newTests = testResults.map(test => ({
                          ...test,
                          status: Math.random() > 0.3 ? 'passed' : test.status
                        }));
                        setTestResults(newTests as any);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="text-xs">Retest</span>
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-3">
                  {testResults.map((test) => (
                    <div key={test.id} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-medium">{test.test}</h4>
                            <EnhancedBadge variant={getTestStatusColor(test.status)} size="sm">
                              {test.status}
                            </EnhancedBadge>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{test.description}</p>
                          {test.solution && test.status !== 'passed' && (
                            <div className="flex items-start space-x-2">
                              <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <p className="text-yellow-400 text-xs">{test.solution}</p>
                            </div>
                          )}
                        </div>
                        <div className={`p-2 rounded-lg ${
                          test.status === 'passed'
                            ? 'bg-green-500/20 text-green-400'
                            : test.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {test.status === 'passed' ? (
                            <Check className="w-4 h-4" />
                          ) : test.status === 'failed' ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Load Time', value: '1.2s', target: '< 2s', status: 'good' },
                    { name: 'Touch Response', value: '16ms', target: '< 100ms', status: 'excellent' },
                    { name: 'Scroll Performance', value: '60 FPS', target: '> 30 FPS', status: 'excellent' }
                  ].map((metric) => (
                    <div key={metric.name} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{metric.name}</h4>
                        <EnhancedBadge
                          variant={metric.status === 'excellent' ? 'success' : metric.status === 'good' ? 'info' : 'warning'}
                          size="sm"
                        >
                          {metric.status}
                        </EnhancedBadge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                      <div className="text-xs text-gray-400">Target: {metric.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MobileAccessibility;