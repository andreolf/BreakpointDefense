import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for a stable game loop using requestAnimationFrame
 * Uses fixed timestep with accumulation for deterministic updates
 * 
 * @param onUpdate Callback called with delta time in ms
 * @param targetFps Target frames per second (default 60)
 * @param running Whether the loop should run
 */
export function useGameLoop(
  onUpdate: (deltaTime: number) => void,
  targetFps: number = 60,
  running: boolean = true
) {
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const callbackRef = useRef(onUpdate);
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);
  
  const targetFrameTime = 1000 / targetFps;
  
  const loop = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = currentTime;
    }
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Accumulate time
    accumulatorRef.current += deltaTime;
    
    // Fixed timestep updates
    // Cap accumulator to prevent spiral of death
    accumulatorRef.current = Math.min(accumulatorRef.current, targetFrameTime * 5);
    
    while (accumulatorRef.current >= targetFrameTime) {
      callbackRef.current(targetFrameTime);
      accumulatorRef.current -= targetFrameTime;
    }
    
    frameRef.current = requestAnimationFrame(loop);
  }, [targetFrameTime]);
  
  useEffect(() => {
    if (running) {
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [running, loop]);
  
  const pause = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  }, []);
  
  const resume = useCallback(() => {
    if (!frameRef.current && running) {
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }
  }, [running, loop]);
  
  return { pause, resume };
}

