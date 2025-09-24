import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  Zap,
  Shield,
  AlertCircle,
  Info,
  Bell,
  Users,
  Target,
  Flame,
  Crown,
  Award
} from 'lucide-react';

// Enhanced Badge Component with multiple styles and animations
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'blue' | 'green' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  pulse?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const EnhancedBadge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  animate = false,
  pulse = false,
  glow = false,
  icon,
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-600/20 border-gray-500/30 text-gray-300',
    success: 'bg-green-600/20 border-green-500/30 text-green-400',
    warning: 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400',
    error: 'bg-red-600/20 border-red-500/30 text-red-400',
    info: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-600/20 border-purple-500/30 text-purple-400',
    blue: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'bg-green-600/20 border-green-500/30 text-green-400',
    orange: 'bg-orange-600/20 border-orange-500/30 text-orange-400',
    red: 'bg-red-600/20 border-red-500/30 text-red-400'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const glowClasses = {
    default: 'shadow-gray-500/20',
    success: 'shadow-green-500/20',
    warning: 'shadow-yellow-500/20',
    error: 'shadow-red-500/20',
    info: 'shadow-blue-500/20',
    purple: 'shadow-purple-500/20',
    blue: 'shadow-blue-500/20',
    green: 'shadow-green-500/20',
    orange: 'shadow-orange-500/20',
    red: 'shadow-red-500/20'
  };

  return (
    <motion.span
      initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      className={`inline-flex items-center space-x-1 font-medium border rounded-full ${variants[variant]} ${sizes[size]} ${glow ? `shadow-lg ${glowClasses[variant]}` : ''} ${className}`}
      style={{
        animation: pulse ? 'pulse 2s infinite' : undefined
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.span>
  );
};

// Status Indicator with color coding and icons
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showIcon = true,
  size = 'md',
  animate = true
}) => {
  const statusConfig = {
    active: {
      color: 'green',
      icon: <CheckCircle className="w-4 h-4" />,
      label: label || 'Active',
      dot: 'bg-green-400'
    },
    inactive: {
      color: 'gray',
      icon: <Minus className="w-4 h-4" />,
      label: label || 'Inactive',
      dot: 'bg-gray-400'
    },
    pending: {
      color: 'yellow',
      icon: <Clock className="w-4 h-4" />,
      label: label || 'Pending',
      dot: 'bg-yellow-400'
    },
    success: {
      color: 'green',
      icon: <CheckCircle className="w-4 h-4" />,
      label: label || 'Success',
      dot: 'bg-green-400'
    },
    error: {
      color: 'red',
      icon: <AlertCircle className="w-4 h-4" />,
      label: label || 'Error',
      dot: 'bg-red-400'
    },
    warning: {
      color: 'orange',
      icon: <AlertTriangle className="w-4 h-4" />,
      label: label || 'Warning',
      dot: 'bg-orange-400'
    }
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]}`}>
      <motion.div
        className={`w-2 h-2 rounded-full ${config.dot}`}
        animate={animate && status === 'pending' ? { 
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        } : undefined}
        transition={animate ? { duration: 2, repeat: Infinity } : undefined}
      />
      {showIcon && (
        <span className={`text-${config.color}-400`}>
          {config.icon}
        </span>
      )}
      <span className={`text-${config.color}-400 font-medium`}>
        {config.label}
      </span>
    </div>
  );
};

// Priority Indicator with visual hierarchy
interface PriorityIndicatorProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  showLabel = true,
  size = 'md'
}) => {
  const priorityConfig = {
    low: {
      color: 'text-green-400',
      bg: 'bg-green-600/20 border-green-500/30',
      icon: <TrendingDown className="w-4 h-4" />,
      label: 'Low'
    },
    medium: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-600/20 border-yellow-500/30',
      icon: <Minus className="w-4 h-4" />,
      label: 'Medium'
    },
    high: {
      color: 'text-orange-400',
      bg: 'bg-orange-600/20 border-orange-500/30',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'High'
    },
    urgent: {
      color: 'text-red-400',
      bg: 'bg-red-600/20 border-red-500/30',
      icon: <Flame className="w-4 h-4" />,
      label: 'Urgent'
    }
  };

  const config = priorityConfig[priority];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center space-x-1 font-medium border rounded-full ${config.bg} ${config.color} ${sizeClasses[size]}`}>
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

// Category Color Coding
interface CategoryTagProps {
  category: 'core' | 'business' | 'marketing' | 'tools' | 'analytics' | 'automation';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  showIcon = true,
  size = 'md'
}) => {
  const categoryConfig = {
    core: {
      color: 'purple',
      icon: <Star className="w-4 h-4" />,
      label: 'Core'
    },
    business: {
      color: 'blue',
      icon: <Users className="w-4 h-4" />,
      label: 'Business'
    },
    marketing: {
      color: 'pink',
      icon: <Target className="w-4 h-4" />,
      label: 'Marketing'
    },
    tools: {
      color: 'green',
      icon: <Zap className="w-4 h-4" />,
      label: 'Tools'
    },
    analytics: {
      color: 'indigo',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Analytics'
    },
    automation: {
      color: 'yellow',
      icon: <Zap className="w-4 h-4" />,
      label: 'Automation'
    }
  };

  const config = categoryConfig[category];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center space-x-1 font-medium border rounded-full bg-${config.color}-600/20 border-${config.color}-500/30 text-${config.color}-400 ${sizeClasses[size]}`}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

// Notification Badge with count and animation
interface NotificationBadgeProps {
  count: number;
  type?: 'default' | 'alert' | 'info' | 'success';
  maxCount?: number;
  animate?: boolean;
  showZero?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  type = 'default',
  maxCount = 99,
  animate = true,
  showZero = false
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const typeConfig = {
    default: 'bg-red-500 text-white',
    alert: 'bg-red-500 text-white animate-pulse',
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white'
  };

  return (
    <motion.span
      initial={animate ? { scale: 0 } : undefined}
      animate={animate ? { scale: 1 } : undefined}
      className={`absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center text-xs font-bold rounded-full ${typeConfig[type]} px-1`}
      style={{
        animation: type === 'alert' && animate ? 'pulse 2s infinite' : undefined
      }}
    >
      {displayCount}
    </motion.span>
  );
};

// Achievement/Feature Badge
interface AchievementBadgeProps {
  type: 'new' | 'featured' | 'premium' | 'beta' | 'hot' | 'trending';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  size = 'sm',
  animate = true
}) => {
  const badgeConfig = {
    new: {
      color: 'bg-blue-500 text-white',
      icon: <Star className="w-3 h-3" />,
      label: 'NEW'
    },
    featured: {
      color: 'bg-purple-500 text-white',
      icon: <Crown className="w-3 h-3" />,
      label: 'FEATURED'
    },
    premium: {
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black',
      icon: <Award className="w-3 h-3" />,
      label: 'PREMIUM'
    },
    beta: {
      color: 'bg-orange-500 text-white',
      icon: <Zap className="w-3 h-3" />,
      label: 'BETA'
    },
    hot: {
      color: 'bg-red-500 text-white',
      icon: <Flame className="w-3 h-3" />,
      label: 'HOT'
    },
    trending: {
      color: 'bg-green-500 text-white',
      icon: <TrendingUp className="w-3 h-3" />,
      label: 'TRENDING'
    }
  };

  const config = badgeConfig[type];
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <motion.span
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      className={`inline-flex items-center space-x-1 font-bold rounded-full ${config.color} ${sizeClasses[size]} shadow-lg`}
      style={{
        animation: (type === 'hot' || type === 'trending') && animate ? 'pulse 2s infinite' : undefined
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </motion.span>
  );
};

// Section Indicator for different functional areas
interface SectionIndicatorProps {
  section: string;
  count?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SectionIndicator: React.FC<SectionIndicatorProps> = ({
  section,
  count,
  showCount = false,
  size = 'md'
}) => {
  const sectionColors: Record<string, string> = {
    'overview': 'purple',
    'ai-console': 'blue',
    'analytics': 'green', 
    'reports': 'indigo',
    'financial': 'emerald',
    'crm': 'blue',
    'campaigns': 'orange',
    'email-marketing': 'red',
    'social-media': 'pink',
    'automations': 'yellow',
    'integrations': 'teal',
    'team': 'violet',
    'settings': 'slate'
  };

  const color = sectionColors[section] || 'gray';
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} rounded-full bg-${color}-400 shadow-lg shadow-${color}-400/30`} />
      {showCount && count !== undefined && (
        <span className={`text-${color}-400 text-sm font-medium`}>
          {count}
        </span>
      )}
    </div>
  );
};

export default {
  EnhancedBadge,
  StatusIndicator,
  PriorityIndicator,
  CategoryTag,
  NotificationBadge,
  AchievementBadge,
  SectionIndicator
};