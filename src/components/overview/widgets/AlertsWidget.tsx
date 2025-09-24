import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X, ArrowRight } from 'lucide-react';
import { AlertItem } from '../../../types/overview';
import { getRelativeTime } from '../../../utils/dateHelpers';

interface AlertsWidgetProps {
  alerts: AlertItem[];
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts }) => {
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'warning': return 'border-yellow-400/50 bg-yellow-400/5 text-yellow-400';
      case 'error': return 'border-red-400/50 bg-red-400/5 text-red-400';
      case 'success': return 'border-green-400/50 bg-green-400/5 text-green-400';
      case 'info': return 'border-blue-400/50 bg-blue-400/5 text-blue-400';
      default: return 'border-gray-400/50 bg-gray-400/5 text-gray-400';
    }
  };

  const getPriorityColor = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-400/20 text-red-400';
      case 'medium': return 'bg-yellow-400/20 text-yellow-400';
      case 'low': return 'bg-blue-400/20 text-blue-400';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  if (unreadAlerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-effect rounded-xl p-4 border border-yellow-400/30 bg-yellow-400/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
          <h3 className="text-white font-semibold">
            {unreadAlerts.length} Alert{unreadAlerts.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <button className="text-gray-400 hover:text-white text-sm">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {unreadAlerts.slice(0, 3).map((alert, index) => {
          const Icon = getAlertIcon(alert.type);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className={`border rounded-lg p-3 ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white text-sm font-medium">
                      {alert.title}
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {alert.priority}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xs mb-2">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {getRelativeTime(alert.timestamp)}
                    </span>
                    
                    {alert.action && (
                      <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center">
                        {alert.action.label}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {unreadAlerts.length > 3 && (
        <div className="mt-3 text-center">
          <button className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
            View {unreadAlerts.length - 3} more alerts
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AlertsWidget;