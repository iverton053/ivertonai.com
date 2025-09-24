import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Mail, 
  Zap, 
  BarChart3,
  Search,
  Database,
  Globe,
  Settings,
  Upload,
  Download,
  Sync,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Icon from '../Icon';

interface LoadingMessage {
  text: string;
  icon: string;
  duration?: number;
  color?: string;
}

interface SmartLoadingProps {
  context: string;
  isLoading: boolean;
  progress?: number;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  customMessages?: LoadingMessage[];
}

interface LoadingContextConfig {
  messages: LoadingMessage[];
  primaryIcon: string;
  color: string;
  estimatedTime?: number;
}

const SmartLoadingStates: React.FC<SmartLoadingProps> = ({
  context,
  isLoading,
  progress = 0,
  error,
  className = '',
  size = 'md',
  showProgress = false,
  customMessages = []
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const contextConfigs: Record<string, LoadingContextConfig> = {
    'ai-analysis': {
      messages: [
        { text: 'Initializing AI analysis engine...', icon: 'Brain', duration: 2000, color: 'purple' },
        { text: 'Processing data patterns...', icon: 'TrendingUp', duration: 3000, color: 'blue' },
        { text: 'Generating insights...', icon: 'Zap', duration: 2500, color: 'yellow' },
        { text: 'Finalizing recommendations...', icon: 'CheckCircle', duration: 1500, color: 'green' }
      ],
      primaryIcon: 'Brain',
      color: 'purple',
      estimatedTime: 9000
    },
    'competitor-analysis': {
      messages: [
        { text: 'Scanning competitor websites...', icon: 'Globe', duration: 3000, color: 'blue' },
        { text: 'Analyzing SEO strategies...', icon: 'Search', duration: 2500, color: 'green' },
        { text: 'Comparing market positioning...', icon: 'Target', duration: 2000, color: 'orange' },
        { text: 'Compiling competitive insights...', icon: 'BarChart3', duration: 1500, color: 'purple' }
      ],
      primaryIcon: 'Target',
      color: 'orange',
      estimatedTime: 9000
    },
    'crm-sync': {
      messages: [
        { text: 'Connecting to CRM database...', icon: 'Database', duration: 2000, color: 'blue' },
        { text: 'Synchronizing contact records...', icon: 'Users', duration: 4000, color: 'green' },
        { text: 'Updating lead scores...', icon: 'TrendingUp', duration: 2000, color: 'purple' },
        { text: 'Finalizing sync...', icon: 'Sync', duration: 1000, color: 'green' }
      ],
      primaryIcon: 'Users',
      color: 'blue',
      estimatedTime: 9000
    },
    'email-campaign': {
      messages: [
        { text: 'Preparing email templates...', icon: 'Mail', duration: 2000, color: 'red' },
        { text: 'Segmenting audience...', icon: 'Users', duration: 2500, color: 'blue' },
        { text: 'Personalizing content...', icon: 'Brain', duration: 3000, color: 'purple' },
        { text: 'Scheduling delivery...', icon: 'Clock', duration: 1500, color: 'green' }
      ],
      primaryIcon: 'Mail',
      color: 'red',
      estimatedTime: 9000
    },
    'automation-workflow': {
      messages: [
        { text: 'Initializing workflow engine...', icon: 'Settings', duration: 1500, color: 'gray' },
        { text: 'Processing triggers...', icon: 'Zap', duration: 2500, color: 'yellow' },
        { text: 'Executing automation steps...', icon: 'Sync', duration: 3500, color: 'blue' },
        { text: 'Monitoring execution...', icon: 'BarChart3', duration: 1500, color: 'green' }
      ],
      primaryIcon: 'Zap',
      color: 'yellow',
      estimatedTime: 9000
    },
    'data-import': {
      messages: [
        { text: 'Validating file format...', icon: 'Shield', duration: 1500, color: 'green' },
        { text: 'Processing data rows...', icon: 'Upload', duration: 4000, color: 'blue' },
        { text: 'Detecting duplicates...', icon: 'Search', duration: 2000, color: 'orange' },
        { text: 'Importing records...', icon: 'Database', duration: 1500, color: 'purple' }
      ],
      primaryIcon: 'Upload',
      color: 'blue',
      estimatedTime: 9000
    },
    'report-generation': {
      messages: [
        { text: 'Collecting data points...', icon: 'Database', duration: 2500, color: 'blue' },
        { text: 'Running calculations...', icon: 'BarChart3', duration: 3000, color: 'green' },
        { text: 'Generating visualizations...', icon: 'TrendingUp', duration: 2500, color: 'purple' },
        { text: 'Formatting report...', icon: 'Download', duration: 1000, color: 'gray' }
      ],
      primaryIcon: 'BarChart3',
      color: 'green',
      estimatedTime: 9000
    },
    'default': {
      messages: [
        { text: 'Loading...', icon: 'Loader', duration: 2000, color: 'blue' },
        { text: 'Processing request...', icon: 'Sync', duration: 2000, color: 'purple' },
        { text: 'Almost ready...', icon: 'CheckCircle', duration: 1000, color: 'green' }
      ],
      primaryIcon: 'Loader',
      color: 'blue',
      estimatedTime: 5000
    }
  };

  const config = contextConfigs[context] || contextConfigs.default;
  const messages = customMessages.length > 0 ? customMessages : config.messages;

  // Cycle through messages
  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      setElapsedTime(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);

    const messageTimer = setTimeout(() => {
      if (currentMessageIndex < messages.length - 1) {
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        setCurrentMessageIndex(0);
      }
    }, messages[currentMessageIndex]?.duration || 2000);

    return () => {
      clearTimeout(messageTimer);
      clearInterval(timer);
    };
  }, [isLoading, currentMessageIndex, messages]);

  const currentMessage = messages[currentMessageIndex];
  const estimatedProgress = config.estimatedTime ? Math.min((elapsedTime / config.estimatedTime) * 100, 95) : progress;

  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      text: 'text-sm',
      title: 'text-base'
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12',
      text: 'text-base',
      title: 'text-lg'
    },
    lg: {
      container: 'p-8',
      icon: 'w-16 h-16',
      text: 'text-lg',
      title: 'text-xl'
    }
  };

  const colorClasses = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    gray: 'text-gray-400'
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`glass-effect rounded-xl border border-red-500/30 ${sizeClasses[size].container} ${className}`}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-red-400"
          >
            <AlertCircle className={sizeClasses[size].icon} />
          </motion.div>
          
          <div>
            <h3 className={`font-semibold text-red-400 ${sizeClasses[size].title} mb-2`}>
              Operation Failed
            </h3>
            <p className={`text-gray-300 ${sizeClasses[size].text}`}>
              {error}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass-effect rounded-xl border border-white/10 ${sizeClasses[size].container} ${className}`}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Main Icon with Animation */}
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: currentMessage?.icon === 'Loader' ? 360 : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className={`${colorClasses[currentMessage?.color || config.color]} ${sizeClasses[size].icon}`}
          >
            <Icon name={currentMessage?.icon || config.primaryIcon} className="w-full h-full" />
          </motion.div>
          
          {/* Pulse effect */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-2 ${
              currentMessage?.color 
                ? `border-${currentMessage.color}-400/20` 
                : `border-${config.color}-400/20`
            }`}
          />
        </div>

        {/* Loading Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <h3 className={`font-semibold text-white ${sizeClasses[size].title}`}>
              {currentMessage?.text || 'Loading...'}
            </h3>
            
            {context !== 'default' && (
              <p className={`text-gray-400 ${sizeClasses[size].text}`}>
                Step {currentMessageIndex + 1} of {messages.length}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        {(showProgress || estimatedProgress > 0) && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{Math.round(estimatedProgress)}%</span>
            </div>
            
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${estimatedProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${
                  currentMessage?.color 
                    ? `from-${currentMessage.color}-400 to-${currentMessage.color}-500`
                    : `from-${config.color}-400 to-${config.color}-500`
                } relative overflow-hidden`}
              >
                {/* Shimmer effect */}
                <motion.div
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Time Indicator */}
        {config.estimatedTime && (
          <div className={`text-gray-500 ${sizeClasses[size].text}`}>
            <Clock className="w-4 h-4 inline mr-2" />
            {elapsedTime < config.estimatedTime ? (
              <>Estimated time: {Math.ceil((config.estimatedTime - elapsedTime) / 1000)}s</>
            ) : (
              <>Taking longer than expected...</>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SmartLoadingStates;