export type TouchPhase = 'start' | 'move' | 'tap';

export type TouchDelta = {
  dx: number;
  dy: number;
};

export type TouchMessage = {
  phase: TouchPhase;
  dx: number;
  dy: number;
};

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export type WebSocketMessage = {
  type: 'touch' | 'error';
  payload: TouchMessage | { message: string };
};

export type TouchIndicatorError = Error & {
  code: string;
};

export function createTouchIndicatorError(message: string, code: string): TouchIndicatorError {
  const error = new Error(message) as TouchIndicatorError;
  error.code = code;
  error.name = 'TouchIndicatorError';
  return error;
}

export type TouchIndicatorSource = {
  message?: TouchMessage | null;
  connectionState?: ConnectionState;
};

export type TouchIndicatorConnection = {
  wsUrl?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
};

export type TouchIndicatorVisual = {
  size?: number;
  color?: string;
  opacity?: number;
};

export type TouchIndicatorAnimation = {
  transitionDuration?: number;
  sensitivity?: number;
  pulseScale?: number;
  pulseDuration?: number;
  rippleScale?: number;
  rippleDuration?: number;
};

export type TouchIndicatorProps = {
  source?: TouchIndicatorSource;
  connection?: TouchIndicatorConnection;
  visual?: TouchIndicatorVisual;
  animation?: TouchIndicatorAnimation;
  onTap?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
  className?: string;
  style?: React.CSSProperties;
  show?: boolean;
  disabled?: boolean;
};

export type UseTouchIndicatorTrackingOptions = {
  message?: TouchMessage | null;
  disabled?: boolean;
  sensitivity?: number;
  size?: number;
  rippleDuration?: number;
  onTap?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
};

export type UseTouchIndicatorTrackingReturn = {
  position: { x: number; y: number };
  isTapping: boolean;
  isInitialized: boolean;
};
