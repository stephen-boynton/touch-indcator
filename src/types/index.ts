export type TouchPhase = 'start' | 'move' | 'tap';

export interface TouchDelta {
  dx: number;
  dy: number;
}

export interface TouchMessage {
  phase: TouchPhase;
  dx: number;
  dy: number;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: 'touch' | 'error';
  payload: TouchMessage | { message: string };
}

export interface TouchIndicatorError extends Error {
  code: string;
}

export function createTouchIndicatorError(message: string, code: string): TouchIndicatorError {
  const error = new Error(message) as TouchIndicatorError;
  error.code = code;
  error.name = 'TouchIndicatorError';
  return error;
}
