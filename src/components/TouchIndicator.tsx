import type { FC } from 'react';
import { useTouchIndicator } from '../hooks/useTouchIndicator';
import { useTouchIndicatorTracking } from '../hooks/useTouchIndicatorTracking';
import { getPositionStyle, getIndicatorStyle, getRippleStyle } from '../lib';
import type {
  TouchIndicatorProps,
  TouchIndicatorSource,
  TouchIndicatorConnection,
  TouchIndicatorVisual,
  TouchIndicatorAnimation,
  ConnectionState,
} from '../types';
import './TouchIndicator.css';

export type {
  TouchIndicatorProps,
  TouchIndicatorSource,
  TouchIndicatorConnection,
  TouchIndicatorVisual,
  TouchIndicatorAnimation,
};

export const TouchIndicator: FC<TouchIndicatorProps> = ({
  source,
  connection,
  visual,
  animation,
  onTap,
  onMove,
  className,
  style,
  show = true,
  disabled = false,
}) => {
  const { message: externalMessage, connectionState: externalConnectionState } = source || {};
  const {
    wsUrl = 'ws://localhost:8080',
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts,
    reconnectInterval,
  } = connection || {};
  const { size = 20, color = '#2196F3', opacity = 0.8 } = visual || {};
  const {
    transitionDuration = 0,
    sensitivity = 1.8,
    pulseScale = 1.5,
    pulseDuration = 150,
    rippleScale = 2.5,
    rippleDuration = 300,
  } = animation || {};

  const useExternalSource = externalMessage !== undefined;

  const {
    connectionState,
    lastMessage,
  }: {
    connectionState: ConnectionState;
    lastMessage: ReturnType<typeof useTouchIndicator>['lastMessage'];
  } = useExternalSource
    ? {
        connectionState: externalConnectionState || 'disconnected',
        lastMessage: externalMessage,
      }
    : useTouchIndicator({
        wsUrl,
        onConnect,
        onDisconnect,
        onError,
        reconnectAttempts,
        reconnectInterval,
      });

  const { position, isTapping, isInitialized } = useTouchIndicatorTracking({
    message: useExternalSource ? externalMessage : lastMessage,
    disabled,
    sensitivity,
    size,
    rippleDuration,
    onTap,
    onMove,
  });

  const isVisible = !disabled && show && (lastMessage !== null || isInitialized);

  const positionStyle = getPositionStyle({
    position,
    isVisible,
    isTapping,
    visual: { size, color, opacity },
    animation: {
      transitionDuration,
      pulseScale,
      pulseDuration,
      rippleScale,
    },
  });

  const indicatorStyle = getIndicatorStyle({
    positionStyle,
    visual: { size, color },
    connectionState,
    isTapping,
    className,
    style,
  });

  const rippleStyle = getRippleStyle({
    position,
    visual: { size, color },
    animation: { rippleScale, rippleDuration },
  });

  return (
    <>
      {isTapping && (
        <div className="touch-indicator-ripple" style={rippleStyle} data-ripple="true" />
      )}
      <div
        className={className}
        style={indicatorStyle}
        data-connection-state={connectionState}
        data-tapping={isTapping}
      />
    </>
  );
};
