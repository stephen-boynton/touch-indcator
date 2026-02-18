import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTouchIndicator } from '../hooks/useTouchIndicator';
import type { ConnectionState, TouchMessage } from '../types';
import { applySensitivity, clampPosition } from '../lib';
import './TouchIndicator.css';

export interface TouchIndicatorProps {
  wsUrl?: string;
  message?: TouchMessage | null;
  connectionState?: ConnectionState;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
  opacity?: number;
  transitionDuration?: number;
  show?: boolean;
  sensitivity?: number;
  pulseScale?: number;
  pulseDuration?: number;
  rippleScale?: number;
  rippleDuration?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const TouchIndicator: FC<TouchIndicatorProps> = ({
  wsUrl,
  message: externalMessage,
  connectionState: externalConnectionState,
  className,
  style,
  size = 20,
  color = '#2196F3',
  opacity = 0.8,
  transitionDuration = 0,
  show = true,
  sensitivity = 1.8,
  pulseScale = 1.5,
  pulseDuration = 150,
  rippleScale = 2.5,
  rippleDuration = 300,
  onConnect,
  onDisconnect,
  onError,
  reconnectAttempts,
  reconnectInterval,
}) => {
  const useExternalSource = externalMessage !== undefined;

  const { connectionState, lastMessage } = useExternalSource
    ? {
        connectionState: externalConnectionState || 'disconnected',
        lastMessage: externalMessage,
      }
    : useTouchIndicator({
        wsUrl: wsUrl || 'ws://localhost:8080',
        onConnect,
        onDisconnect,
        onError,
        reconnectAttempts,
        reconnectInterval,
      });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTapping, setIsTapping] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const msg = useExternalSource ? externalMessage : lastMessage;
    if (!msg) {
      return;
    }

    if (msg.phase === 'start' || msg.phase === 'tap') {
      if (!isInitialized.current) {
        isInitialized.current = true;
      }

      if (msg.phase === 'tap') {
        setIsTapping(true);
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

        return clampPosition(
          newPos.x,
          newPos.y,
          { width: viewportWidth, height: viewportHeight },
          size
        );
      });
    }
  }, [
    lastMessage,
    externalMessage,
    useExternalSource,
    sensitivity,
    size,
    pulseDuration,
    rippleDuration,
  ]);

  const isVisible = show && (lastMessage !== null || isInitialized.current);

  const positionStyle: React.CSSProperties = isVisible
    ? {
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        transform: isTapping
          ? `translate(-50%, -50%) scale(${pulseScale})`
          : 'translate(-50%, -50%) scale(1)',
        transition: isTapping
          ? `transform ${pulseDuration}ms ease-out`
          : transitionDuration > 0
            ? `all ${transitionDuration}ms ease-out`
            : 'none',
        opacity: opacity,
      }
    : {
        opacity: 0,
        transition: transitionDuration > 0 ? `opacity ${transitionDuration}ms ease-out` : 'none',
      };

  return (
    <>
      {isTapping && (
        <div
          className="touch-indicator-ripple"
          style={
            {
              position: 'fixed',
              left: position.x,
              top: position.y,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              '--ripple-scale': rippleScale,
              '--ripple-duration': `${rippleDuration}ms`,
            } as React.CSSProperties
          }
          data-ripple="true"
        />
      )}
      <div
        className={className}
        style={{
          ...style,
          ...positionStyle,
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          pointerEvents: 'none',
          willChange: 'left, top, opacity, transform',
        }}
        data-connection-state={connectionState}
        data-tapping={isTapping}
      />
    </>
  );
};
