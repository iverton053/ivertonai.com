import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Lock, Activity, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSessionSecurity, useAccountSecurity, useSecurityMonitoring } from '../../hooks/useSecurity';

const SecurityMonitor: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    isValid: sessionValid,
    showWarning: sessionWarning,
    timeRemainingFormatted,
    extendSession,
  } = useSessionSecurity();
  
  const {
    isLocked,
    failedAttempts,
    attemptsRemaining,
    lockoutTimeFormatted,
  } = useAccountSecurity();
  
  const { events, recentEvents, hasEvents } = useSecurityMonitoring();

  // Only show if there are security concerns
  const shouldShow = sessionWarning || isLocked || failedAttempts > 0 || !sessionValid;
  
  if (!shouldShow && !isExpanded) {
    return null;
  }

  const getSecurityStatus = () => {
    if (isLocked) return { level: 'critical', text: 'Account Locked', color: 'red' };
    if (!sessionValid) return { level: 'critical', text: 'Session Expired', color: 'red' };
    if (sessionWarning) return { level: 'warning', text: 'Session Expiring', color: 'yellow' };
    if (failedAttempts > 0) return { level: 'warning', text: 'Security Alert', color: 'yellow' };
    return { level: 'secure', text: 'Secure', color: 'green' };
  };

  const status = getSecurityStatus();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <AnimatePresence>
        {(shouldShow || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            className="bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div 
              className={`p-4 cursor-pointer transition-colors ${
                status.color === 'red' ? 'bg-red-600/20 border-b border-red-500/30' :
                status.color === 'yellow' ? 'bg-yellow-600/20 border-b border-yellow-500/30' :
                'bg-green-600/20 border-b border-green-500/30'
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    status.color === 'red' ? 'bg-red-600/30' :
                    status.color === 'yellow' ? 'bg-yellow-600/30' :
                    'bg-green-600/30'
                  }`}>
                    {isLocked ? (
                      <Lock className={`w-4 h-4 ${
                        status.color === 'red' ? 'text-red-400' :
                        status.color === 'yellow' ? 'text-yellow-400' :
                        'text-green-400'
                      }`} />
                    ) : (
                      <Shield className={`w-4 h-4 ${
                        status.color === 'red' ? 'text-red-400' :
                        status.color === 'yellow' ? 'text-yellow-400' :
                        'text-green-400'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{status.text}</h3>
                    {sessionWarning && timeRemainingFormatted && (
                      <p className="text-yellow-300 text-xs">
                        Session expires in {timeRemainingFormatted}
                      </p>
                    )}
                    {isLocked && lockoutTimeFormatted && (
                      <p className="text-red-300 text-xs">
                        Locked for {lockoutTimeFormatted}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {sessionWarning && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        extendSession();
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                    >
                      Extend
                    </motion.button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {/* Security Details */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium text-sm flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span>Security Status</span>
                      </h4>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Session Valid:</span>
                          <span className={sessionValid ? 'text-green-400' : 'text-red-400'}>
                            {sessionValid ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        {failedAttempts > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Failed Attempts:</span>
                            <span className="text-yellow-400">
                              {failedAttempts} ({attemptsRemaining} remaining)
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Status:</span>
                          <span className={isLocked ? 'text-red-400' : 'text-green-400'}>
                            {isLocked ? 'Locked' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Events */}
                    {hasEvents && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span>Recent Events</span>
                          </h4>
                          <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            {showDetails ? 'Hide' : 'Show'} ({recentEvents.length})
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {showDetails && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-1 max-h-32 overflow-y-auto"
                            >
                              {recentEvents.map((event, index) => (
                                <div key={index} className="text-xs p-2 bg-gray-700/50 rounded">
                                  <div className="flex justify-between items-start">
                                    <span className="text-gray-300 capitalize">
                                      {event.type.replace('security-', '').replace('-', ' ')}
                                    </span>
                                    <span className="text-gray-500">
                                      {new Date(event.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Security Tips */}
                    <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                      <h5 className="text-blue-300 font-medium text-xs mb-2">Security Tip</h5>
                      <p className="text-blue-200 text-xs">
                        {isLocked ? 'Account is temporarily locked for security. Wait for the lockout period to expire.' :
                         sessionWarning ? 'Your session is about to expire. Click "Extend" to continue working.' :
                         failedAttempts > 0 ? 'Multiple failed attempts detected. Ensure you\'re using the correct credentials.' :
                         'Your session is secure. All security measures are active.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Always visible security indicator when collapsed */}
      {!shouldShow && !isExpanded && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 bg-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center hover:bg-green-600/30 transition-colors"
          title="Security Status: Secure"
        >
          <Shield className="w-4 h-4 text-green-400" />
        </motion.button>
      )}
    </div>
  );
};

export default SecurityMonitor;