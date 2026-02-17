import { useState, useCallback } from 'react';
import type { TouchData, ConnectionState } from '../types';

interface UseTouchIndicatorOptions {
  wsUrl: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseTouchIndicatorReturn {
  connectionState: ConnectionState;
  lastTouch: TouchData | null;
  isConnected: boolean;
}

export function useTouchIndicator(options: UseTouchIndicatorOptions): UseTouchIndicatorReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastTouch, setLastTouch] = useState<TouchData | null>(null);

  const isConnected = connectionState === 'connected';

  return {
    connectionState,
    lastTouch,
    isConnected,
  };
}
