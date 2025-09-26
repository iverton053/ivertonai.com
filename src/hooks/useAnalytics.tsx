import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AnalyticsEvent {
  event_type: string;
  page_path?: string;
  widget_type?: string;
  session_id: string;
  visitor_id: string;
  duration?: number;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}

interface UseAnalyticsOptions {
  portalId: string;
  userId?: string;
  enabled?: boolean;
}

// Generate a unique visitor ID that persists across sessions
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('portal_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('portal_visitor_id', visitorId);
  }
  return visitorId;
};

// Generate a session ID that changes per browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('portal_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('portal_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = ({ portalId, userId, enabled = true }: UseAnalyticsOptions) => {
  const sessionStartTime = useRef<number>(Date.now());
  const currentPageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string>(window.location.pathname);
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const isFlushingQueue = useRef<boolean>(false);

  // Initialize analytics session
  useEffect(() => {
    if (!enabled || !portalId) return;

    // Track session start
    trackEvent('session_start', {
      page_path: window.location.pathname,
      referrer: document.referrer
    });

    // Track page view
    trackPageView(window.location.pathname);

    // Set up periodic flush of events
    const flushInterval = setInterval(() => {
      flushEventQueue();
    }, 10000); // Flush every 10 seconds

    // Flush events before page unload
    const handleBeforeUnload = () => {
      trackEvent('session_end', {
        session_duration: Date.now() - sessionStartTime.current
      });
      flushEventQueue(true); // Synchronous flush
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEvent('page_hidden', {
          page_path: currentPage.current,
          duration: Date.now() - currentPageStartTime.current
        });
      } else {
        trackEvent('page_visible', {
          page_path: currentPage.current
        });
        currentPageStartTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(flushInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Final flush
      flushEventQueue(true);
    };
  }, [portalId, enabled]);

  const trackEvent = useCallback((eventType: string, data: Partial<AnalyticsEvent> = {}) => {
    if (!enabled || !portalId) return;

    const event: AnalyticsEvent = {
      event_type: eventType,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      ip_address: '', // Will be filled by backend
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      ...data
    };

    // Add to queue for batch processing
    eventQueue.current.push(event);
  }, [enabled, portalId]);

  const trackPageView = useCallback((pagePath: string) => {
    if (!enabled) return;

    // Track time spent on previous page
    if (currentPage.current && currentPage.current !== pagePath) {
      trackEvent('page_view_end', {
        page_path: currentPage.current,
        duration: Date.now() - currentPageStartTime.current
      });
    }

    // Track new page view
    currentPage.current = pagePath;
    currentPageStartTime.current = Date.now();

    trackEvent('page_view', {
      page_path: pagePath
    });
  }, [enabled, trackEvent]);

  const trackWidgetView = useCallback((widgetType: string, metadata?: Record<string, any>) => {
    trackEvent('widget_view', {
      widget_type: widgetType,
      page_path: currentPage.current,
      metadata
    });
  }, [trackEvent]);

  const trackWidgetInteraction = useCallback((widgetType: string, action: string, metadata?: Record<string, any>) => {
    trackEvent('widget_interaction', {
      widget_type: widgetType,
      page_path: currentPage.current,
      metadata: {
        action,
        ...metadata
      }
    });
  }, [trackEvent]);

  const trackDownload = useCallback((fileName: string, fileType: string, fileSize?: number) => {
    trackEvent('download', {
      page_path: currentPage.current,
      metadata: {
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize
      }
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    trackEvent('search', {
      page_path: currentPage.current,
      metadata: {
        query,
        results_count: resultsCount
      }
    });
  }, [trackEvent]);

  const trackError = useCallback((errorType: string, errorMessage: string, metadata?: Record<string, any>) => {
    trackEvent('error', {
      page_path: currentPage.current,
      metadata: {
        error_type: errorType,
        error_message: errorMessage,
        ...metadata
      }
    });
  }, [trackEvent]);

  const trackCustomEvent = useCallback((eventName: string, metadata?: Record<string, any>) => {
    trackEvent('custom_event', {
      page_path: currentPage.current,
      metadata: {
        event_name: eventName,
        ...metadata
      }
    });
  }, [trackEvent]);

  const flushEventQueue = useCallback(async (synchronous = false) => {
    if (isFlushingQueue.current || eventQueue.current.length === 0) return;

    isFlushingQueue.current = true;
    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      const analyticsData = events.map(event => ({
        client_portal_id: portalId,
        user_id: userId,
        ...event,
        created_at: new Date().toISOString()
      }));

      if (synchronous) {
        // Use sendBeacon for synchronous requests during page unload
        const data = JSON.stringify({ events: analyticsData });
        navigator.sendBeacon('/api/analytics', data);
      } else {
        // Insert into database
        const { error } = await supabase
          .from('portal_analytics')
          .insert(analyticsData);

        if (error) {
          console.error('Error saving analytics:', error);
          // Re-queue events on failure
          eventQueue.current.unshift(...events);
        }
      }
    } catch (error) {
      console.error('Error flushing analytics queue:', error);
      // Re-queue events on failure
      eventQueue.current.unshift(...events);
    } finally {
      isFlushingQueue.current = false;
    }
  }, [portalId, userId]);

  // Performance tracking utilities
  const measurePerformance = useCallback((name: string, fn: () => void | Promise<void>) => {
    const start = performance.now();

    const finish = () => {
      const duration = performance.now() - start;
      trackEvent('performance', {
        page_path: currentPage.current,
        metadata: {
          measurement_name: name,
          duration: Math.round(duration)
        }
      });
    };

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(finish);
      } else {
        finish();
        return result;
      }
    } catch (error) {
      finish();
      throw error;
    }
  }, [trackEvent]);

  // A/B testing utilities
  const trackConversion = useCallback((conversionType: string, value?: number, metadata?: Record<string, any>) => {
    trackEvent('conversion', {
      page_path: currentPage.current,
      metadata: {
        conversion_type: conversionType,
        value,
        ...metadata
      }
    });
  }, [trackEvent]);

  // User behavior tracking
  const trackUserAction = useCallback((action: string, target?: string, metadata?: Record<string, any>) => {
    trackEvent('user_action', {
      page_path: currentPage.current,
      metadata: {
        action,
        target,
        timestamp: Date.now(),
        ...metadata
      }
    });
  }, [trackEvent]);

  // Heat map data (simplified)
  const trackClick = useCallback((x: number, y: number, element?: string) => {
    trackEvent('click', {
      page_path: currentPage.current,
      metadata: {
        x,
        y,
        element,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      }
    });
  }, [trackEvent]);

  const trackScroll = useCallback((scrollDepth: number) => {
    trackEvent('scroll', {
      page_path: currentPage.current,
      metadata: {
        scroll_depth: Math.round(scrollDepth),
        page_height: document.documentElement.scrollHeight,
        viewport_height: window.innerHeight
      }
    });
  }, [trackEvent]);

  return {
    // Core tracking functions
    trackEvent,
    trackPageView,
    trackWidgetView,
    trackWidgetInteraction,
    trackDownload,
    trackSearch,
    trackError,
    trackCustomEvent,

    // Performance tracking
    measurePerformance,

    // Conversion tracking
    trackConversion,

    // User behavior
    trackUserAction,
    trackClick,
    trackScroll,

    // Utilities
    flushEventQueue,

    // Session info
    sessionId: getSessionId(),
    visitorId: getVisitorId()
  };
};

// Analytics context provider for easier access
import { createContext, useContext } from 'react';

interface AnalyticsContextType {
  trackEvent: (eventType: string, data?: Partial<AnalyticsEvent>) => void;
  trackPageView: (pagePath: string) => void;
  trackWidgetView: (widgetType: string, metadata?: Record<string, any>) => void;
  trackWidgetInteraction: (widgetType: string, action: string, metadata?: Record<string, any>) => void;
  trackDownload: (fileName: string, fileType: string, fileSize?: number) => void;
  trackSearch: (query: string, resultsCount?: number) => void;
  trackError: (errorType: string, errorMessage: string, metadata?: Record<string, any>) => void;
  trackCustomEvent: (eventName: string, metadata?: Record<string, any>) => void;
  measurePerformance: (name: string, fn: () => void | Promise<void>) => void | Promise<void>;
  trackConversion: (conversionType: string, value?: number, metadata?: Record<string, any>) => void;
  trackUserAction: (action: string, target?: string, metadata?: Record<string, any>) => void;
  trackClick: (x: number, y: number, element?: string) => void;
  trackScroll: (scrollDepth: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{
  children: React.ReactNode;
  portalId: string;
  userId?: string;
  enabled?: boolean;
}> = ({ children, portalId, userId, enabled = true }) => {
  const analytics = useAnalytics({ portalId, userId, enabled });

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};