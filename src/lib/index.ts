import type { ConnectionState } from '../types';

export { createLogger } from './logger';
export type { Logger } from './logger';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applySensitivity(
  dx: number,
  dy: number,
  sensitivity: number
): { dx: number; dy: number } {
  return {
    dx: dx * sensitivity,
    dy: dy * sensitivity,
  };
}

export function clampPosition(
  x: number,
  y: number,
  bounds: { width: number; height: number },
  indicatorSize: number
): { x: number; y: number } {
  const halfSize = indicatorSize / 2;
  return {
    x: clamp(x, halfSize, bounds.width - halfSize),
    y: clamp(y, halfSize, bounds.height - halfSize),
  };
}

export interface PositionStyleOptions {
  position: { x: number; y: number };
  isVisible: boolean;
  isTapping: boolean;
  visual: {
    size: number;
    color: string;
    opacity: number;
  };
  animation: {
    transitionDuration: number;
    pulseScale: number;
    pulseDuration: number;
    rippleScale: number;
  };
}

export function getPositionStyle({
  position,
  isVisible,
  isTapping,
  visual,
  animation,
}: PositionStyleOptions): React.CSSProperties {
  return isVisible
    ? {
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        transform: isTapping
          ? `translate(-50%, -50%) scale(${animation.pulseScale})`
          : 'translate(-50%, -50%) scale(1)',
        transition: isTapping
          ? `transform ${animation.pulseDuration}ms ease-out`
          : animation.transitionDuration > 0
            ? `all ${animation.transitionDuration}ms ease-out`
            : 'none',
        opacity: visual.opacity,
      }
    : {
        opacity: 0,
        transition:
          animation.transitionDuration > 0
            ? `opacity ${animation.transitionDuration}ms ease-out`
            : 'none',
      };
}

export function getIndicatorStyle({
  positionStyle,
  visual,
  connectionState: _connectionState,
  isTapping: _isTapping,
  className: _className,
  style,
}: {
  positionStyle: React.CSSProperties;
  visual: { size: number; color: string };
  connectionState: ConnectionState;
  isTapping: boolean;
  className?: string;
  style?: React.CSSProperties;
}): React.CSSProperties {
  return {
    zIndex: 9999,
    ...style,
    ...positionStyle,
    width: visual.size,
    height: visual.size,
    borderRadius: '50%',
    backgroundColor: visual.color,
    pointerEvents: 'none',
    willChange: 'left, top, opacity, transform',
  };
}

export function getRippleStyle({
  position,
  visual,
  animation,
}: {
  position: { x: number; y: number };
  visual: { size: number; color: string };
  animation: { rippleScale: number; rippleDuration: number };
}): React.CSSProperties {
  return {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: visual.size,
    height: visual.size,
    borderRadius: '50%',
    backgroundColor: visual.color,
    '--ripple-scale': animation.rippleScale,
    '--ripple-duration': `${animation.rippleDuration}ms`,
  } as React.CSSProperties;
}
