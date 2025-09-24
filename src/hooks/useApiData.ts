import { useState, useEffect, useCallback, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { ApiResponse, ApiError, LoadingState } from '../types';

export interface UseApiDataOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  cacheKey?: string;
  cacheTTL?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clear: () => void;
  lastFetch: number | null;
}

const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useApiData<T>(
  apiCall: () => Promise<ApiResponse<T> | ApiError>,
  options: UseApiDataOptions = {}
): UseApiDataReturn<T> {
  const {
    autoFetch = true,
    refetchInterval,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);

  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Check cache
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null;
    
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    return null;
  }, [cacheKey]);

  // Set cache
  const setCachedData = useCallback((data: T) => {
    if (cacheKey) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL,
      });
    }
  }, [cacheKey, cacheTTL]);

  // Fetch function with retry logic
  const fetchData = useCallback(async (isRetry = false): Promise<void> => {
    if (!isRetry) {
      retryCountRef.current = 0;
    }

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData && !isRetry) {
      setData(cachedData);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success) {
        const apiResponse = response as ApiResponse<T>;
        setData(apiResponse.data);
        setError(null);
        setLastFetch(Date.now());
        setCachedData(apiResponse.data);
        onSuccess?.(apiResponse.data);
        retryCountRef.current = 0;
      } else {
        const apiError = response as ApiError;
        throw new Error(apiError.error);
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apiCall, getCachedData, setCachedData, onSuccess, onError, retryAttempts, retryDelay]);

  // Refetch function
  const refetch = useCallback(async () => {
    // Clear cache for this key
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    await fetchData();
  }, [fetchData, cacheKey]);

  // Clear function
  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetch(null);
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [cacheKey]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchData]);

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!loading) {
          refetch();
        }
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, loading, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    clear,
    lastFetch,
  };
}

// Specialized hooks for common API calls
export function useUserData() {
  return useApiData(
    () => mockApi.getCurrentUser(),
    {
      cacheKey: 'user_data',
      cacheTTL: 10 * 60 * 1000, // 10 minutes
      autoFetch: true,
    }
  );
}

export function useAnalytics(timeRange: '24h' | '7d' | '30d' = '24h') {
  return useApiData(
    () => mockApi.getAnalytics(timeRange),
    {
      cacheKey: `analytics_${timeRange}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    }
  );
}

export function useAutomations() {
  return useApiData(
    () => mockApi.getAutomations(),
    {
      cacheKey: 'automations',
      cacheTTL: 30 * 1000, // 30 seconds for real-time feel
      refetchInterval: 10 * 1000, // Refresh every 10 seconds
    }
  );
}

export function useWidgetData(widgetId: string, type: string) {
  return useApiData(
    () => mockApi.getWidgetData(widgetId, type),
    {
      cacheKey: `widget_${widgetId}_${type}`,
      cacheTTL: 60 * 1000, // 1 minute
      refetchInterval: 30 * 1000, // Refresh every 30 seconds
      autoFetch: !!widgetId,
    }
  );
}

// Real-time data hook
export function useRealTimeUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const connect = () => {
      setIsConnected(true);
      unsubscribe = mockApi.subscribeToRealTimeUpdates((update) => {
        setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
      });
    };

    connect();

    return () => {
      setIsConnected(false);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    isConnected,
    clearUpdates,
  };
}

// Cache management utilities
export const cacheUtils = {
  clear: () => {
    cache.clear();
  },
  
  clearKey: (key: string) => {
    cache.delete(key);
  },
  
  getSize: () => {
    return cache.size;
  },
  
  getKeys: () => {
    return Array.from(cache.keys());
  },
  
  invalidateExpired: () => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        cache.delete(key);
      }
    }
  },
};