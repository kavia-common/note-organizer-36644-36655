import { useCallback, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 */
export function useDebouncedCallback(callback, delay = 400) {
  /** Debounce wrapper around a callback to reduce frequent calls */
  const timer = useRef(null);

  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}
