import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { ThemeMode } from '../../types/theme';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const { mode, currentTheme, setMode, toggleMode } = useThemeStore();

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const getIcon = (themeMode: ThemeMode, isActive: boolean = false) => {
    const iconProps = {
      size: iconSize[size],
      className: isActive ? 'text-current' : 'text-current opacity-70',
    };

    switch (themeMode) {
      case 'light':
        return <Sun {...iconProps} />;
      case 'dark':
        return <Moon {...iconProps} />;
      case 'system':
        return <Monitor {...iconProps} />;
    }
  };

  const getModeLabel = (themeMode: ThemeMode): string => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMode}
        className={`
          relative ${sizeClasses[size]} rounded-lg
          bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-800/70
          border border-gray-200/20 dark:border-gray-700/50
          backdrop-blur-sm transition-all duration-300
          flex items-center justify-center
          text-gray-700 dark:text-gray-300
          ${className}
        `}
        title={`Current: ${getModeLabel(mode)} (Click to toggle)`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {getIcon(mode, true)}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === 'dropdown') {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];

    return (
      <div className={`relative ${className}`}>
        <motion.div
          className="
            flex items-center space-x-1 p-1 rounded-lg
            bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm
            border border-gray-200/20 dark:border-gray-700/50
          "
        >
          {modes.map((themeMode) => (
            <motion.button
              key={themeMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(themeMode)}
              className={`
                ${sizeClasses[size]} rounded-md transition-all duration-200
                flex items-center justify-center
                ${
                  mode === themeMode
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/50'
                }
              `}
              title={getModeLabel(themeMode)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${themeMode}-${mode === themeMode}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {getIcon(themeMode, mode === themeMode)}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>
        
        {showLabel && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2"
          >
            {getModeLabel(mode)} Mode
          </motion.p>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMode}
        className={`
          relative ${sizeClasses[size]} rounded-xl
          bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/60 dark:to-gray-800/30
          hover:from-white/30 hover:to-white/10 dark:hover:from-gray-700/70 dark:hover:to-gray-700/40
          border border-white/20 dark:border-gray-700/50
          backdrop-blur-sm transition-all duration-300
          flex items-center justify-center
          text-gray-700 dark:text-gray-300
          shadow-lg hover:shadow-xl
        `}
        title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme}
            initial={{ rotate: -180, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.4, 
              ease: 'easeInOut',
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          >
            {currentTheme === 'light' ? (
              <Sun size={iconSize[size]} className="text-amber-500" />
            ) : (
              <Moon size={iconSize[size]} className="text-blue-400" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0"
          animate={{
            opacity: currentTheme === 'light' ? [0, 0.3, 0] : [0, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: currentTheme === 'light' 
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          }}
        />
      </motion.button>

      {showLabel && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {currentTheme === 'light' ? 'Light' : 'Dark'}
        </motion.span>
      )}
    </div>
  );
};

export default ThemeToggle;