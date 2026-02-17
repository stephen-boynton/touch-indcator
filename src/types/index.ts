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
