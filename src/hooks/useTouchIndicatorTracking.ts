import { useState, useEffect, useRef } from 'react';
import { applySensitivity, clampPosition, createLogger } from '../lib';
import type {
  UseTouchIndicatorTrackingOptions,
  UseTouchIndicatorTrackingReturn,
  TouchPhase,
} from '../types';

const logger = createLogger('TouchIndicator:Tracking');

export type { UseTouchIndicatorTrackingOptions, UseTouchIndicatorTrackingReturn };

export function useTouchIndicatorTracking({
  message,
  disabled,
  sensitivity = 1.8,
  size = 20,
  onMove,
}: UseTouchIndicatorTrackingOptions): UseTouchIndicatorTrackingReturn {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState<TouchPhase | null>(null);
  const isInitialized = useRef(false);

  const onMoveRef = useRef(onMove);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    if (disabled) {
      logger.debug('Tracking disabled');
      return;
    }

    const msg = message;
    if (!msg) {
      return;
    }

    if (msg.phase === 'start') {
      if (!isInitialized.current) {
        isInitialized.current = true;
        logger.debug('Tracking initialized');
      }
      setPhase('start');
      return;
    }

    if (msg.phase === 'tap') {
      setPhase('tap');
      return;
    }

    if (msg.phase === 'move') {
      setPhase('move');

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

        logger.debug('Position updated:', clamped);
        onMoveRef.current?.(clamped);

        return clamped;
      });
    }
  }, [message, disabled, sensitivity, size]);

  return {
    position,
    phase,
    isInitialized: isInitialized.current,
  };
}
