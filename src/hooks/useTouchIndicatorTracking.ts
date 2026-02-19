import { useState, useEffect, useRef } from 'react';
import { applySensitivity, clampPosition, createLogger } from '../lib';
import type { UseTouchIndicatorTrackingOptions, UseTouchIndicatorTrackingReturn } from '../types';

const logger = createLogger('TouchIndicator:Tracking');

export type { UseTouchIndicatorTrackingOptions, UseTouchIndicatorTrackingReturn };

export function useTouchIndicatorTracking({
  message,
  disabled,
  sensitivity = 1.8,
  size = 20,
  rippleDuration = 300,
  tapDelay = 150,
  tapMovementThreshold = 5,
  onTap,
  onMove,
}: UseTouchIndicatorTrackingOptions): UseTouchIndicatorTrackingReturn {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTapping, setIsTapping] = useState(false);
  const isInitialized = useRef(false);
  const tapStartTime = useRef<number | null>(null);
  const isPotentialTap = useRef(false);
  const movementAccumulated = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    if (disabled) {
      logger.debug('Tracking disabled');
      return;
    }

    const msg = message;
    if (!msg) {
      return;
    }

    if (msg.phase === 'start' || msg.phase === 'tap') {
      if (!isInitialized.current) {
        isInitialized.current = true;
        logger.debug('Tracking initialized');
      }

      if (msg.phase === 'start') {
        tapStartTime.current = Date.now();
        isPotentialTap.current = true;
        movementAccumulated.current = { dx: 0, dy: 0 };
        return;
      }

      if (msg.phase === 'tap') {
        logger.debug('Tap phase:', {
          isPotentialTap: isPotentialTap.current,
          tapStartTime: tapStartTime.current,
          elapsed: tapStartTime.current ? Date.now() - tapStartTime.current : 0,
          totalMovement: Math.sqrt(
            movementAccumulated.current.dx ** 2 + movementAccumulated.current.dy ** 2
          ),
        });
        const elapsed = tapStartTime.current ? Date.now() - tapStartTime.current : 0;
        const totalMovement = Math.sqrt(
          movementAccumulated.current.dx ** 2 + movementAccumulated.current.dy ** 2
        );
        if (
          isPotentialTap.current &&
          elapsed >= tapDelay &&
          totalMovement <= tapMovementThreshold
        ) {
          logger.debug('Tap detected');
          setIsTapping(true);
          onTap?.();
          setTimeout(() => setIsTapping(false), rippleDuration);
        }
        tapStartTime.current = null;
        isPotentialTap.current = false;
        movementAccumulated.current = { dx: 0, dy: 0 };
      }
      return;
    }

    if (msg.phase === 'move') {
      movementAccumulated.current.dx += msg.dx;
      movementAccumulated.current.dy += msg.dy;

      const totalMovement = Math.sqrt(
        movementAccumulated.current.dx ** 2 + movementAccumulated.current.dy ** 2
      );

      if (totalMovement > tapMovementThreshold) {
        isPotentialTap.current = false;
        tapStartTime.current = null;
      }

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
        onMove?.(clamped);

        return clamped;
      });
    }
  }, [
    message,
    disabled,
    sensitivity,
    size,
    rippleDuration,
    tapDelay,
    tapMovementThreshold,
    onTap,
    onMove,
  ]);

  return {
    position,
    isTapping,
    isInitialized: isInitialized.current,
  };
}
