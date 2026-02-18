export { TouchIndicator } from './components/TouchIndicator';
export type { TouchIndicatorProps } from './components/TouchIndicator';
export { useTouchIndicator } from './hooks/useTouchIndicator';
export type { UseTouchIndicatorOptions, UseTouchIndicatorReturn } from './hooks/useTouchIndicator';
export type {
  TouchPhase,
  TouchDelta,
  TouchMessage,
  ConnectionState,
  TouchIndicatorError,
  WebSocketMessage,
} from './types';
export { createTouchIndicatorError } from './types';
export { clamp, applySensitivity, clampPosition } from './lib';
