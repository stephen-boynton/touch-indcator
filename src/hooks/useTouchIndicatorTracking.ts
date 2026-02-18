import { useState, useEffect, useRef } from 'react';
import { applySensitivity, clampPosition } from '../lib';
import type { UseTouchIndicatorTrackingOptions, UseTouchIndicatorTrackingReturn } from '../types';

export type { UseTouchIndicatorTrackingOptions, UseTouchIndicatorTrackingReturn };

export function useTouchIndicatorTracking({
  message,
  disabled,
  sensitivity = 1.8,
  size = 20,
  rippleDuration = 300,
  onTap,
  onMove,
}: UseTouchIndicatorTrackingOptions): UseTouchIndicatorTrackingReturn {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTapping, setIsTapping] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const msg = message;
    if (!msg) {
      return;
    }

    if (msg.phase === 'start' || msg.phase === 'tap') {
      if (!isInitialized.current) {
        isInitialized.current = true;
      }

      if (msg.phase === 'tap') {
        setIsTapping(true);
        onTap?.();
        setTimeout(() => setIsTapping(false), rippleDuration);
      }
      return;
    }

    if (msg.phase === 'move') {
      const scaled = applySensitivity(msg.dx, msg.dy, sensitivity);

      setPosition(prev => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const newPos = {
          x: prev.x + scaled.dx,
          y: prev.y + scaled.dy,
        };

        const clamped = clampPosition(
          newPos.x,
          newPos.y,
          { width: viewportWidth, height: viewportHeight },
          size
        );

        onMove?.(clamped);

        return clamped;
      });
    }
  }, [message, disabled, sensitivity, size, rippleDuration, onTap, onMove]);

  return {
    position,
    isTapping,
    isInitialized: isInitialized.current,
  };
}
