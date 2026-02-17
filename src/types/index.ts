export interface TouchData {
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
  touchId?: number;
}

export interface TouchEvent {
  type: 'start' | 'move' | 'end' | 'cancel';
  touches: TouchData[];
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface TouchIndicatorError extends Error {
  code: string;
}

export function createTouchIndicatorError(message: string, code: string): TouchIndicatorError {
  const error = new Error(message) as TouchIndicatorError;
  error.code = code;
  error.name = 'TouchIndicatorError';
  return error;
}

export interface WebSocketMessage {
  type: 'touch' | 'event' | 'error';
  payload: TouchData | TouchEvent | { message: string };
}
