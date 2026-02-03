/**
 * Performance utilities for React optimization
 */

/**
 * Debounce function to limit the rate of function execution
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function to limit function execution to once per specified time
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize expensive computations
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Deep equality check for objects and arrays
 * @param a - First value
 * @param b - Second value
 * @returns True if deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Create a stable reference that only updates when deep equality changes
 * Useful for dependency arrays
 */
export function useDeepCompareMemoize<T>(value: T): T {
  const ref = React.useRef<T>(value);

  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Measure component render time (development only)
 * @param componentName - Name of the component
 * @param callback - Callback to execute
 */
export function measureRender(componentName: string, callback: () => void): void {
  if (import.meta.env.DEV) {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) {
      // Log if render takes longer than one frame (60fps = 16.67ms)
      console.warn(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  } else {
    callback();
  }
}

/**
 * Lazy load images with intersection observer
 * @param threshold - Intersection threshold (0-1)
 * @returns Ref to attach to image element
 */
export function useLazyImage(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Virtual scrolling hook for large lists
 * @param items - Array of items
 * @param itemHeight - Height of each item in pixels
 * @param containerHeight - Height of the container
 * @returns Visible items and scroll handler
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    Math.ceil((scrollTop + containerHeight) / itemHeight),
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    []
  );

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
}

// Re-export React for convenience
import React from "react";
