import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTouchIndicator } from '../hooks/useTouchIndicator';
import type { ConnectionState, TouchMessage } from '../types';
import { applySensitivity, clampPosition } from '../lib';

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
  color = 'rgba(0, 0, 0, 0.5)',
  opacity = 1,
  transitionDuration = 0,
  show = true,
  sensitivity = 1.8,
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
  }, [lastMessage, externalMessage, useExternalSource, sensitivity, size]);

  const isVisible = show && (lastMessage !== null || isInitialized.current);

  const positionStyle: React.CSSProperties = isVisible
    ? {
        position: 'fixed' as const,
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        transition: transitionDuration > 0 ? `all ${transitionDuration}ms ease-out` : 'none',
        opacity: opacity,
      }
    : {
        opacity: 0,
        transition: transitionDuration > 0 ? `opacity ${transitionDuration}ms ease-out` : 'none',
      };

  return (
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
        willChange: 'left, top, opacity',
      }}
      data-connection-state={connectionState}
    />
  );
};
