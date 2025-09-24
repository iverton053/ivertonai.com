import { useRef, useEffect } from 'react';

type EventListener<T extends Event = Event> = (event: T) => void;

/**
 * Custom hook for managing event listeners with automatic cleanup
 * Prevents memory leaks by properly removing event listeners on unmount
 */
function useEventListener<T extends Event = Event>(
  eventName: string,
  handler: EventListener<T>,
  element?: HTMLElement | Window | Document | null,
  options?: boolean | AddEventListenerOptions
) {
  // Create a ref that stores handler
  const savedHandler = useRef<EventListener<T>>();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler
  // without us needing to pass it in effect deps array
  // and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement = element ?? window;
    
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    // Create event listener that calls handler function stored in ref
    const eventListener: EventListener<T> = (event) => savedHandler.current?.(event);

    targetElement.addEventListener(eventName, eventListener as EventListener, options);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener as EventListener, options);
    };
  }, [eventName, element, options]);
}

export default useEventListener;