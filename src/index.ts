export { TouchIndicator } from './components/TouchIndicator';
export type { TouchIndicatorProps } from './components/TouchIndicator';
export { useTouchIndicator } from './hooks/useTouchIndicator';
export type { UseTouchIndicatorOptions, UseTouchIndicatorReturn } from './hooks/useTouchIndicator';
export type {
  TouchData,
  TouchEvent,
  ConnectionState,
  TouchIndicatorError,
  WebSocketMessage,
} from './types';
export { createTouchIndicatorError } from './types';
export {
  isValidTouchData,
  normalizeCoordinates,
  clamp,
  calculateDistance,
  calculateVelocity,
} from './lib';
