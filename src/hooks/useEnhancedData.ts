import { useState, useEffect, useCallback, useRef } from 'react';
import { cache, widgetCache, userCache, analyticsCache } from '../services/cache';
import { mockApi } from '../services/mockApi';
import { migrationService } from '../services/migration';
import { ValidationUtils, ValidationResult } from '../utils/validation';
import { ApiResponse, ApiError, LoadingState } from '../types';

/**
 * Enhanced data fetching hook with advanced caching, retry logic, and error handling
 */
export interface UseEnhancedDataOptions {
  cacheStrategy?: 'none' | 'memory' | 'persistent' | 'hybrid';
  cacheService?: typeof cache;
  cacheTTL?: number;
  autoFetch?: boolean;
  refetchInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  validateResponse?: boolean;
  validationSchema?: any;
  errorBoundary?: boolean;
  loadingDebounce?: number;
}

export interface UseEnhancedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<T | null>;
  refresh: () => Promise<T | null>;
  clear: () => void;
  validate: () => ValidationResult | null;
  lastFetch: number | null;
  cacheInfo: {
    cached: boolean;
    cacheAge: number | null;
    hitRate: number;
  };
}

export function useEnhancedData<T>(
  key: string,
  apiCall: () => Promise<ApiResponse<T> | ApiError>,
  options: UseEnhancedDataOptions = {}
): UseEnhancedDataReturn<T> {
  const {
    cacheStrategy = 'hybrid',
    cacheService = cache,
    cacheTTL = 5 * 60 * 1000,
    autoFetch = true,
    refetchInterval,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    validateResponse = false,
    validationSchema,
    errorBoundary = false,
    loadingDebounce = 100,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [cacheInfo, setCacheInfo] = useState({
    cached: false,
    cacheAge: null as number | null,
    hitRate: 0,
  });

  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced cache operations
  const getCachedData = useCallback((): { data: T | null; age: number | null } => {
    if (cacheStrategy === 'none') return { data: null, age: null };

    const cached = cacheService.get<T>(key);
    if (cached) {
      // Calculate cache age
      const cacheEntry = (cacheService as any).cache?.get(key);
      const age = cacheEntry ? Date.now() - cacheEntry.timestamp : null;
      return { data: cached, age };
    }

    return { data: null, age: null };
  }, [key, cacheStrategy, cacheService]);

  const setCachedData = useCallback((data: T) => {
    if (cacheStrategy !== 'none') {
      cacheService.set(key, data, cacheTTL);
    }
  }, [key, cacheStrategy, cacheService, cacheTTL]);

  // Enhanced fetch with comprehensive error handling
  const fetchData = useCallback(async (options: { 
    force?: boolean; 
    skipCache?: boolean; 
    isRetry?: boolean 
  } = {}): Promise<T | null> => {
    const { force = false, skipCache = false, isRetry = false } = options;

    if (!isRetry) {
      retryCountRef.current = 0;
    }

    // Check cache first
    if (!skipCache && !force) {
      const { data: cachedData, age } = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setError(null);
        setCacheInfo({
          cached: true,
          cacheAge: age,
          hitRate: cacheService.getStats?.()?.hitRate || 0,
        });
        return cachedData;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Debounced loading state
    if (loadingDebounce > 0) {
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, loadingDebounce);
    } else {
      setLoading(true);
    }

    setError(null);
    setCacheInfo(prev => ({ ...prev, cached: false }));

    try {
      const response = await apiCall();

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      if (response.success) {
        const apiResponse = response as ApiResponse<T>;
        let responseData = apiResponse.data;

        // Validate response if requested
        if (validateResponse && validationSchema) {
          const validation = ValidationUtils.validateWithSchema(responseData, validationSchema);
          if (!validation.isValid) {
            const errorMsg = `Response validation failed: ${Object.values(validation.errors).flat().join(', ')}`;
            throw new Error(errorMsg);
          }
          responseData = validation.data || responseData;
        }

        setData(responseData);
        setError(null);
        setLastFetch(Date.now());
        setCachedData(responseData);
        setCacheInfo({
          cached: false,
          cacheAge: null,
          hitRate: cacheService.getStats?.()?.hitRate || 0,
        });
        
        onSuccess?.(responseData);
        retryCountRef.current = 0;
        
        return responseData;
      } else {
        const apiError = response as ApiError;
        throw new Error(apiError.error || 'API request failed');
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Enhanced retry logic with exponential backoff
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        const backoffDelay = retryDelay * Math.pow(2, retryCountRef.current - 1);
        
        console.warn(`Retry attempt ${retryCountRef.current}/${retryAttempts} in ${backoffDelay}ms for ${key}`);
        
        setTimeout(() => {
          fetchData({ ...options, isRetry: true });
        }, backoffDelay);
        
        return null;
      }

      // All retries failed
      setError(errorMessage);
      onError?.(errorMessage);

      // Error boundary integration
      if (errorBoundary && typeof window !== 'undefined') {
        console.error(`Critical data fetch error for ${key}:`, err);
        // Could integrate with error reporting service here
      }

      return null;
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    key,
    apiCall,
    getCachedData,
    setCachedData,
    cacheService,
    retryAttempts,
    retryDelay,
    onSuccess,
    onError,
    validateResponse,
    validationSchema,
    errorBoundary,
    loadingDebounce,
  ]);

  // Refetch (force fresh data)
  const refetch = useCallback(async (): Promise<T | null> => {
    return await fetchData({ force: true, skipCache: true });
  }, [fetchData]);

  // Refresh (check cache first, then fetch if needed)
  const refresh = useCallback(async (): Promise<T | null> => {
    return await fetchData({ force: false });
  }, [fetchData]);

  // Clear data and cache
  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetch(null);
    setCacheInfo({ cached: false, cacheAge: null, hitRate: 0 });
    
    if (cacheStrategy !== 'none') {
      cacheService.delete(key);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [key, cacheStrategy, cacheService]);

  // Validate current data
  const validate = useCallback((): ValidationResult | null => {
    if (!validationSchema || !data) return null;
    return ValidationUtils.validateWithSchema(data, validationSchema);
  }, [validationSchema, data]);

  // Auto-fetch on mount - FIXED: Removed fetchData from dependencies to prevent infinite loop
  // Only runs when autoFetch changes or on mount, not when fetchData changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [autoFetch]); // FIXED: Removed fetchData dependency that was causing infinite rerenders

  // Refetch interval - FIXED: Removed refresh from dependencies to prevent infinite loop
  // Instead, we'll call fetchData directly to avoid dependency cycles
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!loading) {
          // FIXED: Call fetchData directly instead of refresh to avoid dependency loop
          fetchData({ force: false });
        }
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, loading]); // FIXED: Removed refresh dependency that was causing infinite rerenders

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    refresh,
    clear,
    validate,
    lastFetch,
    cacheInfo,
  };
}

/**
 * Specialized hooks for different data types
 */

// Enhanced user data hook
export function useEnhancedUserData() {
  return useEnhancedData(
    'user_data',
    () => mockApi.getCurrentUser(),
    {
      cacheService: userCache,
      cacheTTL: 10 * 60 * 1000,
      autoFetch: true,
      retryAttempts: 5,
      validateResponse: true,
      // validationSchema: UserDataSchema, // Would import from types
    }
  );
}

// Enhanced widget data hook
export function useEnhancedWidgetData(widgetId: string, type: string) {
  return useEnhancedData(
    `widget_${widgetId}_${type}`,
    () => mockApi.getWidgetData(widgetId, type),
    {
      cacheService: widgetCache,
      cacheTTL: 30 * 1000,
      refetchInterval: 15 * 1000,
      autoFetch: !!widgetId,
      retryAttempts: 3,
      loadingDebounce: 50,
    }
  );
}

// Enhanced analytics hook
export function useEnhancedAnalytics(timeRange: '24h' | '7d' | '30d' = '24h') {
  return useEnhancedData(
    `analytics_${timeRange}`,
    () => mockApi.getAnalytics(timeRange),
    {
      cacheService: analyticsCache,
      cacheTTL: 2 * 60 * 1000,
      refetchInterval: 60 * 1000,
      retryAttempts: 3,
    }
  );
}

/**
 * Data synchronization hook for keeping multiple data sources in sync
 */
export function useDataSync(keys: string[], syncInterval = 30 * 1000) {
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncData = useCallback(async () => {
    setSyncing(true);
    
    try {
      // Invalidate all specified cache keys
      keys.forEach(key => {
        cache.delete(key);
        widgetCache.delete(key);
        userCache.delete(key);
        analyticsCache.delete(key);
      });

      setLastSync(Date.now());
    } catch (error) {
      console.error('Data sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [keys]);

  // FIXED: Removed syncData from dependencies to prevent infinite loop
  // syncData function recreates on every render due to keys dependency
  useEffect(() => {
    if (syncInterval > 0) {
      const interval = setInterval(() => {
        // FIXED: Call syncData directly without depending on the function in useEffect deps
        setSyncing(true);
        
        try {
          // Invalidate all specified cache keys
          keys.forEach(key => {
            cache.delete(key);
            widgetCache.delete(key);
            userCache.delete(key);
            analyticsCache.delete(key);
          });

          setLastSync(Date.now());
        } catch (error) {
          console.error('Data sync failed:', error);
        } finally {
          setSyncing(false);
        }
      }, syncInterval);
      
      return () => clearInterval(interval);
    }
  }, [syncInterval, keys]); // FIXED: Removed syncData dependency, added keys directly

  return {
    lastSync,
    syncing,
    syncData,
  };
}

/**
 * Migration status hook
 */
export function useMigrationStatus() {
  const [migrationStatus, setMigrationStatus] = useState<{
    needsMigration: boolean;
    currentVersion: string;
    targetVersion: string;
    isRunning: boolean;
    error: string | null;
  }>({
    needsMigration: false,
    currentVersion: '0.0.0',
    targetVersion: '1.0.0',
    isRunning: false,
    error: null,
  });

  const checkMigrationStatus = useCallback(() => {
    setMigrationStatus(prev => ({
      ...prev,
      needsMigration: migrationService.needsMigration(),
      currentVersion: migrationService.getCurrentVersion(),
      targetVersion: migrationService.getTargetVersion(),
    }));
  }, []);

  const runMigration = useCallback(async () => {
    setMigrationStatus(prev => ({ ...prev, isRunning: true, error: null }));
    
    try {
      const result = await migrationService.runMigrations();
      
      if (result.success) {
        setMigrationStatus(prev => ({
          ...prev,
          needsMigration: false,
          currentVersion: migrationService.getCurrentVersion(),
          isRunning: false,
        }));
      } else {
        setMigrationStatus(prev => ({
          ...prev,
          isRunning: false,
          error: result.errors.join(', '),
        }));
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Migration failed';
      setMigrationStatus(prev => ({
        ...prev,
        isRunning: false,
        error: errorMsg,
      }));
      throw error;
    }
  }, []);

  // FIXED: Run migration status check only once on mount to prevent infinite loop
  // checkMigrationStatus was causing rerenders because it updates state that it depends on
  useEffect(() => {
    checkMigrationStatus();
  }, []); // FIXED: Empty dependency array - only run once on mount

  return {
    ...migrationStatus,
    runMigration,
    checkMigrationStatus,
  };
}