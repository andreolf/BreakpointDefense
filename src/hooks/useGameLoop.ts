/**
 * Game Loop Hook
 * Uses requestAnimationFrame for smooth 60fps updates
 */

import { useEffect, useRef, useCallback } from 'react';

export function useGameLoop(
  callback: (deltaMs: number) => void,
  isRunning: boolean = true
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaMs = Math.min(time - previousTimeRef.current, 100); // Cap at 100ms
      callback(deltaMs);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, animate]);
}
