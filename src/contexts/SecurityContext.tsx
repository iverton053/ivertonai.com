import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { csrfService, CSRFToken } from '../services/csrfService';
import { securityHeadersService } from '../services/securityHeadersService';
import { notificationService } from '../services/notificationService';

export interface SecurityConfig {
  csrfProtection: boolean;
  strictMode: boolean;
  sessionTimeout: number;
  maxFailedAttempts: number;
  lockoutDuration: number;
  requireSecureConnection: boolean;
}

export interface SecurityState {
  isSecure: boolean;
  csrfToken: string | null;
  nonce: string;
  sessionExpiry: number | null;
  failedAttempts: number;
  isLocked: boolean;
  lastActivity: number;
}

export interface SecurityContextType {
  // State
  state: SecurityState;
  config: SecurityConfig;
  
  // CSRF Methods
  getCsrfToken: () => Promise<string | null>;
  refreshCsrfToken: () => Promise<void>;
  validateCsrfToken: (token: string) => Promise<boolean>;
  
  // Security Headers
  getNonce: () => string;
  getSecurityHeaders: () => Promise<Record<string, string>>;
  
  // Session Management
  updateActivity: () => void;
  isSessionValid: () => boolean;
  extendSession: () => void;
  invalidateSession: () => void;
  
  // Security Events
  recordFailedAttempt: () => void;
  clearFailedAttempts: () => void;
  isAccountLocked: () => boolean;
  
  // Configuration
  updateConfig: (newConfig: Partial<SecurityConfig>) => void;
}

const defaultConfig: SecurityConfig = {
  csrfProtection: true,
  strictMode: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  requireSecureConnection: window.location.protocol === 'https:',
};

const defaultState: SecurityState = {
  isSecure: window.location.protocol === 'https:',
  csrfToken: null,
  nonce: '',
  sessionExpiry: null,
  failedAttempts: 0,
  isLocked: false,
  lastActivity: Date.now(),
};

const SecurityContext = createContext<SecurityContextType | null>(null);

export interface SecurityProviderProps {
  children: ReactNode;
  config?: Partial<SecurityConfig>;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  config: initialConfig = {},
}) => {
  const [config] = useState<SecurityConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const [state, setState] = useState<SecurityState>(() => {
    const stored = localStorage.getItem('security_state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...defaultState,
          ...parsed,
          csrfToken: null, // Always refresh CSRF token on load
          nonce: securityHeadersService.getNonce(),
        };
      } catch {
        return {
          ...defaultState,
          nonce: securityHeadersService.getNonce(),
        };
      }
    }
    return {
      ...defaultState,
      nonce: securityHeadersService.getNonce(),
    };
  });

  // Persist security state
  useEffect(() => {
    const stateToStore = {
      ...state,
      csrfToken: null, // Don't persist CSRF tokens
    };
    localStorage.setItem('security_state', JSON.stringify(stateToStore));
  }, [state]);

  // Initialize CSRF token
  useEffect(() => {
    if (config.csrfProtection) {
      csrfService.getToken().then(token => {
        setState(prev => ({ ...prev, csrfToken: token }));
      }).catch(console.error);
      
      // Listen for token refresh events
      const handleTokenRefresh = (event: CustomEvent) => {
        setState(prev => ({ ...prev, csrfToken: event.detail.token }));
      };
      
      window.addEventListener('csrf-token-refreshed', handleTokenRefresh as EventListener);
      return () => {
        window.removeEventListener('csrf-token-refreshed', handleTokenRefresh as EventListener);
      };
    }
  }, [config.csrfProtection]);

  // Session timeout management
  useEffect(() => {
    if (!state.sessionExpiry) {
      const expiry = Date.now() + config.sessionTimeout;
      setState(prev => ({ ...prev, sessionExpiry: expiry }));
    }

    const checkSession = () => {
      const now = Date.now();
      if (state.sessionExpiry && now > state.sessionExpiry) {
        // Send session expired notification
        notificationService.addSecurity(
          'session_expired',
          'Session Expired',
          'Your session has expired for security reasons. Please log in again.',
          'high'
        );
        invalidateSession();
      } else if (state.sessionExpiry) {
        // Check for session warning (5 minutes before expiry)
        const timeUntilExpiry = state.sessionExpiry - now;
        const warningThreshold = 5 * 60 * 1000; // 5 minutes
        
        if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
          const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000));
          notificationService.addSecurity(
            'session_warning',
            'Session Expiring Soon',
            `Your session will expire in ${minutesLeft} minute(s). Click to extend your session.`,
            'medium',
            [{
              label: 'Extend Session',
              action: () => extendSession(),
              style: 'primary'
            }]
          );
        }
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.sessionExpiry, config.sessionTimeout]);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => {
      setState(prev => ({ ...prev, lastActivity: Date.now() }));
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Lockout management
  useEffect(() => {
    if (state.isLocked) {
      const unlockTime = state.lastActivity + config.lockoutDuration;
      const timeUntilUnlock = unlockTime - Date.now();
      
      if (timeUntilUnlock > 0) {
        const timeout = setTimeout(() => {
          setState(prev => ({
            ...prev,
            isLocked: false,
            failedAttempts: 0,
          }));
        }, timeUntilUnlock);
        
        return () => clearTimeout(timeout);
      } else {
        setState(prev => ({
          ...prev,
          isLocked: false,
          failedAttempts: 0,
        }));
      }
    }
  }, [state.isLocked, state.lastActivity, config.lockoutDuration]);

  const getCsrfToken = useCallback(async (): Promise<string | null> => {
    return config.csrfProtection ? await csrfService.getToken() : null;
  }, [config.csrfProtection]);

  const refreshCsrfToken = useCallback(async (): Promise<void> => {
    if (config.csrfProtection) {
      const newToken = await csrfService.refreshToken();
      setState(prev => ({ ...prev, csrfToken: newToken.token }));
    }
  }, [config.csrfProtection]);

  const validateCsrfToken = useCallback(async (token: string): Promise<boolean> => {
    return config.csrfProtection ? await csrfService.validateToken(token) : true;
  }, [config.csrfProtection]);

  const getNonce = useCallback((): string => {
    return securityHeadersService.getNonce();
  }, []);

  const getSecurityHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    
    if (config.csrfProtection) {
      const csrfHeaders = await csrfService.getHeaders();
      Object.assign(headers, csrfHeaders);
    }
    
    return headers;
  }, [config.csrfProtection]);

  const updateActivity = useCallback((): void => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      lastActivity: now,
      sessionExpiry: now + config.sessionTimeout,
    }));
  }, [config.sessionTimeout]);

  const isSessionValid = useCallback((): boolean => {
    if (!state.sessionExpiry) return true;
    return Date.now() < state.sessionExpiry;
  }, [state.sessionExpiry]);

  const extendSession = useCallback((): void => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      sessionExpiry: now + config.sessionTimeout,
      lastActivity: now,
    }));
  }, [config.sessionTimeout]);

  const invalidateSession = useCallback((): void => {
    setState(prev => ({
      ...prev,
      sessionExpiry: null,
      csrfToken: null,
    }));
    
    if (config.csrfProtection) {
      csrfService.clearToken();
    }
    
    // Dispatch session expired event
    window.dispatchEvent(new CustomEvent('security-session-expired'));
  }, [config.csrfProtection]);

  const recordFailedAttempt = useCallback((): void => {
    setState(prev => {
      const newFailedAttempts = prev.failedAttempts + 1;
      const shouldLock = newFailedAttempts >= config.maxFailedAttempts;
      
      // Send notification for failed attempt
      notificationService.addSecurity(
        'failed_attempt',
        'Security Alert',
        `Failed login attempt detected. ${config.maxFailedAttempts - newFailedAttempts} attempts remaining.`,
        newFailedAttempts >= 3 ? 'high' : 'medium'
      );

      // Send notification if account gets locked
      if (shouldLock) {
        notificationService.addSecurity(
          'account_locked',
          'Account Locked',
          `Account locked for ${config.lockoutDuration / 60000} minutes due to multiple failed attempts.`,
          'critical',
          [{
            label: 'Learn More',
            action: () => console.log('Show security help'),
            style: 'primary'
          }]
        );
      }
      
      return {
        ...prev,
        failedAttempts: newFailedAttempts,
        isLocked: shouldLock,
        lastActivity: Date.now(),
      };
    });
  }, [config.maxFailedAttempts, config.lockoutDuration]);

  const clearFailedAttempts = useCallback((): void => {
    setState(prev => ({
      ...prev,
      failedAttempts: 0,
      isLocked: false,
    }));
  }, []);

  const isAccountLocked = useCallback((): boolean => {
    return state.isLocked;
  }, [state.isLocked]);

  const updateConfig = useCallback((newConfig: Partial<SecurityConfig>): void => {
    // Note: This would typically require a re-render of the provider
    console.warn('Security config updates require application restart');
  }, []);

  const contextValue: SecurityContextType = {
    state,
    config,
    getCsrfToken,
    refreshCsrfToken,
    validateCsrfToken,
    getNonce,
    getSecurityHeaders,
    updateActivity,
    isSessionValid,
    extendSession,
    invalidateSession,
    recordFailedAttempt,
    clearFailedAttempts,
    isAccountLocked,
    updateConfig,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};