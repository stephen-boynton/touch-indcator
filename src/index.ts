export { TouchIndicator } from './components/TouchIndicator';
export type {
  TouchIndicatorProps,
  TouchIndicatorSource,
  TouchIndicatorConnection,
  TouchIndicatorVisual,
  TouchIndicatorAnimation,
} from './types';
export { useTouchIndicator } from './hooks/useTouchIndicator';
export { useTouchIndicatorTracking } from './hooks/useTouchIndicatorTracking';
export type { UseTouchIndicatorOptions, UseTouchIndicatorReturn } from './hooks/useTouchIndicator';
export type { UseTouchIndicatorTrackingOptions, UseTouchIndicatorTrackingReturn } from './types';
export type {
  TouchPhase,
  TouchDelta,
  TouchMessage,
  ConnectionState,
  TouchIndicatorError,
  WebSocketMessage,
} from './types';
export { createTouchIndicatorError } from './types';
export {
  clamp,
  applySensitivity,
  clampPosition,
  getPositionStyle,
  getIndicatorStyle,
  getRippleStyle,
} from './lib';
