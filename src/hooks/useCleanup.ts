import { useEffect, useRef } from 'react';

type CleanupFunction = () => void;

/**
 * Custom hook for managing cleanup operations
 * Ensures all cleanup functions are called when component unmounts
 */
function useCleanup() {
  const cleanupFunctions = useRef<CleanupFunction[]>([]);

  const addCleanup = (cleanup: CleanupFunction) => {
    cleanupFunctions.current.push(cleanup);
  };

  const cleanup = () => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    cleanupFunctions.current = [];
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return { addCleanup, cleanup };
}

/**
 * Hook for managing timers with automatic cleanup
 */
function useTimer() {
  const timers = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeout = (callback: () => void, delay: number) => {
    const timer = globalThis.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
    return timer;
  };

  const setInterval = (callback: () => void, delay: number) => {
    const timer = globalThis.setInterval(callback, delay);
    timers.current.add(timer);
    return timer;
  };

  const clearTimer = (timer: NodeJS.Timeout) => {
    globalThis.clearTimeout(timer);
    globalThis.clearInterval(timer);
    timers.current.delete(timer);
  };

  const clearAllTimers = () => {
    timers.current.forEach(timer => {
      globalThis.clearTimeout(timer);
      globalThis.clearInterval(timer);
    });
    timers.current.clear();
  };

  useEffect(() => {
    return clearAllTimers;
  }, []);

  return { setTimeout, setInterval, clearTimer, clearAllTimers };
}

/**
 * Hook for managing async operations with cancellation
 */
function useAsyncOperation() {
  const abortControllers = useRef<Set<AbortController>>(new Set());

  const createOperation = <T>(
    operation: (signal: AbortSignal) => Promise<T>
  ): Promise<T> => {
    const controller = new AbortController();
    abortControllers.current.add(controller);

    return operation(controller.signal).finally(() => {
      abortControllers.current.delete(controller);
    });
  };

  const abortAll = () => {
    abortControllers.current.forEach(controller => {
      controller.abort();
    });
    abortControllers.current.clear();
  };

  useEffect(() => {
    return abortAll;
  }, []);

  return { createOperation, abortAll };
}

export { useCleanup, useTimer, useAsyncOperation };