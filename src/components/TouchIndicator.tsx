import type { FC } from 'react';
import { useTouchIndicator } from '../hooks/useTouchIndicator';
import type { TouchData, ConnectionState } from '../types';

export interface TouchIndicatorProps {
  wsUrl?: string;
  touchData?: TouchData | null;
  connectionState?: ConnectionState;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
  opacity?: number;
  transitionDuration?: number;
  show?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const TouchIndicator: FC<TouchIndicatorProps> = ({
  wsUrl,
  touchData: externalTouchData,
  connectionState: externalConnectionState,
  className,
  style,
  size = 20,
  color = 'rgba(0, 0, 0, 0.5)',
  opacity = 1,
  transitionDuration = 0,
  show = true,
  onConnect,
  onDisconnect,
  onError,
  reconnectAttempts,
  reconnectInterval,
}) => {
  const useExternalSource = externalTouchData !== undefined;

  const { connectionState, lastTouch } = useExternalSource
    ? { connectionState: externalConnectionState || 'disconnected', lastTouch: externalTouchData }
    : useTouchIndicator({
        wsUrl: wsUrl || 'ws://localhost:8080',
        onConnect,
        onDisconnect,
        onError,
        reconnectAttempts,
        reconnectInterval,
      });

  const isVisible = show && lastTouch !== null;

  const positionStyle: React.CSSProperties = isVisible
    ? {
        position: 'fixed' as const,
        left: lastTouch.x,
        top: lastTouch.y,
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
