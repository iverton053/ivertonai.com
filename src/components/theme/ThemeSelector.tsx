import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { ThemeColorScheme, ThemeMode } from '../../types/theme';

const colorSchemes: Array<{
  key: ThemeColorScheme;
  name: string;
  description: string;
  colors: {
    light: string[];
    dark: string[];
  };
}> = [
  {
    key: 'default',
    name: 'Default',
    description: 'Clean and professional indigo theme',
    colors: {
      light: ['rgb(99 102 241)', 'rgb(129 140 248)', 'rgb(165 180 252)'],
      dark: ['rgb(129 140 248)', 'rgb(165 180 252)', 'rgb(196 181 253)'],
    },
  },
  {
    key: 'purple',
    name: 'Purple',
    description: 'Rich and vibrant violet theme',
    colors: {
      light: ['rgb(147 51 234)', 'rgb(168 85 247)', 'rgb(196 181 253)'],
      dark: ['rgb(168 85 247)', 'rgb(196 181 253)', 'rgb(221 214 254)'],
    },
  },
  {
    key: 'blue',
    name: 'Ocean Blue',
    description: 'Calm and trustworthy blue theme',
    colors: {
      light: ['rgb(37 99 235)', 'rgb(59 130 246)', 'rgb(147 197 253)'],
      dark: ['rgb(59 130 246)', 'rgb(96 165 250)', 'rgb(147 197 253)'],
    },
  },
  {
    key: 'green',
    name: 'Nature Green',
    description: 'Fresh and energetic green theme',
    colors: {
      light: ['rgb(22 163 74)', 'rgb(34 197 94)', 'rgb(134 239 172)'],
      dark: ['rgb(34 197 94)', 'rgb(74 222 128)', 'rgb(134 239 172)'],
    },
  },
  {
    key: 'orange',
    name: 'Warm Orange',
    description: 'Energetic and creative orange theme',
    colors: {
      light: ['rgb(234 88 12)', 'rgb(249 115 22)', 'rgb(253 186 116)'],
      dark: ['rgb(249 115 22)', 'rgb(251 146 60)', 'rgb(253 186 116)'],
    },
  },
  {
    key: 'pink',
    name: 'Playful Pink',
    description: 'Creative and modern pink theme',
    colors: {
      light: ['rgb(219 39 119)', 'rgb(236 72 153)', 'rgb(249 168 212)'],
      dark: ['rgb(236 72 153)', 'rgb(244 114 182)', 'rgb(249 168 212)'],
    },
  },
];

const themeModes: Array<{
  key: ThemeMode;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  {
    key: 'light',
    name: 'Light',
    description: 'Always use light theme',
    icon: Sun,
  },
  {
    key: 'dark',
    name: 'Dark',
    description: 'Always use dark theme',
    icon: Moon,
  },
  {
    key: 'system',
    name: 'System',
    description: 'Follow system preference',
    icon: Monitor,
  },
];

const ThemeSelector: React.FC = () => {
  const { 
    mode, 
    colorScheme, 
    currentTheme,
    systemDetection,
    setMode, 
    setColorScheme, 
    setSystemDetection 
  } = useThemeStore();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const ColorSchemePreview: React.FC<{ 
    scheme: typeof colorSchemes[0]; 
    isSelected: boolean;
  }> = ({ scheme, isSelected }) => (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setColorScheme(scheme.key)}
      className={`
        relative p-4 rounded-xl transition-all duration-300
        border-2 ${isSelected 
          ? 'border-primary shadow-lg shadow-primary/25' 
          : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
        }
        bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
        hover:bg-white/70 dark:hover:bg-gray-800/70
      `}
    >
      {/* Color Preview */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex space-x-1">
          {scheme.colors[currentTheme].map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto p-1 bg-primary text-white rounded-full"
          >
            <Check size={12} />
          </motion.div>
        )}
      </div>
      
      {/* Details */}
      <div className="text-left">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          {scheme.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {scheme.description}
        </p>
      </div>
    </motion.button>
  );

  const ThemeModeOption: React.FC<{ 
    themeMode: typeof themeModes[0]; 
    isSelected: boolean;
  }> = ({ themeMode, isSelected }) => {
    const Icon = themeMode.icon;
    
    return (
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setMode(themeMode.key)}
        className={`
          relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-300
          border ${isSelected 
            ? 'border-primary bg-primary/10 text-primary' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm
          hover:bg-white/50 dark:hover:bg-gray-800/50
          text-gray-900 dark:text-gray-100
        `}
      >
        <Icon size={20} className={isSelected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'} />
        <div className="flex-1 text-left">
          <div className="font-medium">{themeMode.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {themeMode.description}
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-primary"
          >
            <Check size={16} />
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Theme Preferences
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customize your dashboard appearance
          </p>
        </div>
      </motion.div>

      {/* Theme Mode Selection */}
      <motion.div variants={itemVariants}>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
          Theme Mode
        </h4>
        <div className="space-y-2">
          {themeModes.map((themeMode) => (
            <ThemeModeOption
              key={themeMode.key}
              themeMode={themeMode}
              isSelected={mode === themeMode.key}
            />
          ))}
        </div>
      </motion.div>

      {/* System Detection Toggle */}
      <motion.div variants={itemVariants}>
        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              System Theme Detection
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Automatically update theme when system preference changes
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSystemDetection(!systemDetection)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${systemDetection ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}
            `}
          >
            <motion.span
              layout
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform"
              style={{
                x: systemDetection ? 24 : 4,
              }}
            />
          </motion.button>
        </label>
      </motion.div>

      {/* Color Scheme Selection */}
      <motion.div variants={itemVariants}>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
          Color Scheme
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colorSchemes.map((scheme) => (
            <ColorSchemePreview
              key={scheme.key}
              scheme={scheme}
              isSelected={colorScheme === scheme.key}
            />
          ))}
        </div>
      </motion.div>

      {/* Preview Section */}
      <motion.div variants={itemVariants}>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
          Preview
        </h4>
        <div className="p-6 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-text">Sample Dashboard Card</h5>
                <p className="text-sm text-text-secondary">With your selected theme</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              Active
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 h-2 bg-primary rounded-full"></div>
            <div className="flex-1 h-2 bg-secondary rounded-full"></div>
            <div className="flex-1 h-2 bg-accent rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeSelector;