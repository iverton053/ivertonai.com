import { useCallback, useEffect, useState } from 'react';
import { useSecurity as useSecurityContext } from '../contexts/SecurityContext';

// Custom hook for CSRF protection in forms
export const useCSRFProtection = () => {
  const { getCsrfToken, refreshCsrfToken, validateCsrfToken } = useSecurityContext();
  
  const [token, setToken] = useState<string | null>(null);

  // Initialize token on mount
  useEffect(() => {
    getCsrfToken().then(setToken).catch(console.error);
  }, [getCsrfToken]);

  useEffect(() => {
    const handleTokenRefresh = () => {
      getCsrfToken().then(setToken).catch(console.error);
    };

    window.addEventListener('csrf-token-refreshed', handleTokenRefresh);
    return () => window.removeEventListener('csrf-token-refreshed', handleTokenRefresh);
  }, [getCsrfToken]);

  const getTokenForRequest = useCallback(async () => {
    const currentToken = await getCsrfToken();
    setToken(currentToken);
    return currentToken;
  }, [getCsrfToken]);

  const refresh = useCallback(async () => {
    await refreshCsrfToken();
    const newToken = await getCsrfToken();
    setToken(newToken);
  }, [refreshCsrfToken, getCsrfToken]);

  return {
    token,
    getToken: getTokenForRequest,
    refreshToken: refresh,
    validateToken: validateCsrfToken,
    isValid: token !== null,
  };
};

// Hook for session management
export const useSessionSecurity = () => {
  const {
    state,
    isSessionValid,
    extendSession,
    invalidateSession,
    updateActivity,
  } = useSecurityContext();

  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!state.sessionExpiry) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = state.sessionExpiry! - now;
      setTimeUntilExpiry(timeLeft);

      // Show warning 5 minutes before expiry
      const warningThreshold = 5 * 60 * 1000; // 5 minutes
      setSessionWarning(timeLeft <= warningThreshold && timeLeft > 0);

      if (timeLeft <= 0) {
        invalidateSession();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.sessionExpiry, invalidateSession]);

  const formatTimeRemaining = useCallback((milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    isValid: isSessionValid(),
    timeUntilExpiry,
    showWarning: sessionWarning,
    timeRemainingFormatted: timeUntilExpiry ? formatTimeRemaining(timeUntilExpiry) : null,
    extendSession,
    invalidateSession,
    updateActivity,
    lastActivity: new Date(state.lastActivity),
  };
};

// Hook for account lockout protection
export const useAccountSecurity = () => {
  const {
    state,
    config,
    recordFailedAttempt,
    clearFailedAttempts,
    isAccountLocked,
  } = useSecurityContext();

  const attemptsRemaining = config.maxFailedAttempts - state.failedAttempts;
  const lockoutTimeRemaining = state.isLocked 
    ? Math.max(0, (state.lastActivity + config.lockoutDuration) - Date.now())
    : 0;

  const formatLockoutTime = useCallback((milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    isLocked: isAccountLocked(),
    failedAttempts: state.failedAttempts,
    attemptsRemaining: Math.max(0, attemptsRemaining),
    maxAttempts: config.maxFailedAttempts,
    lockoutTimeRemaining,
    lockoutTimeFormatted: lockoutTimeRemaining > 0 
      ? formatLockoutTime(lockoutTimeRemaining)
      : null,
    recordFailedAttempt,
    clearFailedAttempts,
  };
};

// Hook for secure API requests
export const useSecureRequest = () => {
  const { getSecurityHeaders, getCsrfToken, state } = useSecurityContext();

  const createSecureHeaders = useCallback(async (additionalHeaders: Record<string, string> = {}) => {
    const securityHeaders = await getSecurityHeaders();
    
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...securityHeaders,
      ...additionalHeaders,
    };
  }, [getSecurityHeaders]);

  const secureRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // Validate session before request
    if (!state.sessionExpiry || Date.now() > state.sessionExpiry) {
      throw new Error('Session expired. Please log in again.');
    }

    const headers = await createSecureHeaders(options.headers as Record<string, string>);
    
    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'same-origin',
      mode: 'same-origin',
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Handle CSRF token refresh if needed
      if (response.status === 403 && response.headers.get('X-CSRF-Token-Invalid')) {
        // Token might be expired, refresh and retry once
        const token = await getCsrfToken();
        if (token) {
          const retryHeaders = await createSecureHeaders({
            ...(options.headers as Record<string, string>),
          });
          
          const retryResponse = await fetch(url, {
            ...requestOptions,
            headers: retryHeaders,
          });
          
          return retryResponse;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Secure request failed:', error);
      throw error;
    }
  }, [createSecureHeaders, getCsrfToken, state.sessionExpiry]);

  const securePost = useCallback(async (
    url: string,
    data: any,
    options: RequestInit = {}
  ): Promise<Response> => {
    return secureRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }, [secureRequest]);

  const securePut = useCallback(async (
    url: string,
    data: any,
    options: RequestInit = {}
  ): Promise<Response> => {
    return secureRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }, [secureRequest]);

  const secureDelete = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    return secureRequest(url, {
      method: 'DELETE',
      ...options,
    });
  }, [secureRequest]);

  return {
    createSecureHeaders,
    secureRequest,
    securePost,
    securePut,
    secureDelete,
  };
};

// Hook for content security policy compliance
export const useCSPCompliance = () => {
  const { getNonce } = useSecurityContext();

  const createInlineStyle = useCallback((css: string): HTMLStyleElement => {
    const style = document.createElement('style');
    style.nonce = getNonce();
    style.textContent = css;
    return style;
  }, [getNonce]);

  const createInlineScript = useCallback((js: string): HTMLScriptElement => {
    const script = document.createElement('script');
    script.nonce = getNonce();
    script.textContent = js;
    return script;
  }, [getNonce]);

  const addInlineStyle = useCallback((css: string): void => {
    const style = createInlineStyle(css);
    document.head.appendChild(style);
  }, [createInlineStyle]);

  const addInlineScript = useCallback((js: string): void => {
    const script = createInlineScript(js);
    document.body.appendChild(script);
  }, [createInlineScript]);

  return {
    nonce: getNonce(),
    createInlineStyle,
    createInlineScript,
    addInlineStyle,
    addInlineScript,
  };
};

// Hook for security event monitoring
export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<Array<{
    type: string;
    timestamp: number;
    details: any;
  }>>([]);

  useEffect(() => {
    const handleSecurityEvent = (event: CustomEvent) => {
      setSecurityEvents(prev => [...prev.slice(-99), {
        type: event.type,
        timestamp: Date.now(),
        details: event.detail,
      }]);
    };

    const securityEventTypes = [
      'csrf-token-refreshed',
      'security-session-expired',
      'security-failed-attempt',
      'security-account-locked',
    ];

    securityEventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleSecurityEvent as EventListener);
    });

    return () => {
      securityEventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleSecurityEvent as EventListener);
      });
    };
  }, []);

  const clearEvents = useCallback(() => {
    setSecurityEvents([]);
  }, []);

  return {
    events: securityEvents,
    clearEvents,
    hasEvents: securityEvents.length > 0,
    recentEvents: securityEvents.slice(-10),
  };
};