import { useEffect, useRef, useCallback, useState } from 'react';
import type { TouchData, ConnectionState } from '../types';

export interface UseTouchIndicatorOptions {
  wsUrl: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export interface UseTouchIndicatorReturn {
  connectionState: ConnectionState;
  lastTouch: TouchData | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const DEFAULT_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_INTERVAL = 1000;

export function useTouchIndicator(options: UseTouchIndicatorOptions): UseTouchIndicatorReturn {
  const {
    wsUrl,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
    reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectionStateRef = useRef<ConnectionState>('disconnected');
  const lastTouchRef = useRef<TouchData | null>(null);

  const [, setStateTrigger] = useState(0);

  const updateState = useCallback(
    (connectionState: ConnectionState, lastTouch: TouchData | null) => {
      connectionStateRef.current = connectionState;
      lastTouchRef.current = lastTouch;
      setStateTrigger(n => n + 1);
    },
    []
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateState('connecting', lastTouchRef.current);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectCountRef.current = 0;
        updateState('connected', lastTouchRef.current);
        onConnect?.();
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as TouchData;
          updateState(connectionStateRef.current, data);
        } catch {
          console.warn('Invalid touch data received');
        }
      };

      ws.onerror = error => {
        onError?.(error);
      };

      ws.onclose = () => {
        updateState('disconnected', lastTouchRef.current);
        onDisconnect?.();

        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          const delay = reconnectInterval * Math.pow(2, reconnectCountRef.current - 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          updateState('error', lastTouchRef.current);
        }
      };
    } catch {
      updateState('error', lastTouchRef.current);
    }
  }, [wsUrl, onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval, updateState]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectCountRef.current = reconnectAttempts;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateState('disconnected', null);
  }, [reconnectAttempts, updateState]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [wsUrl]);

  return {
    connectionState: connectionStateRef.current,
    lastTouch: lastTouchRef.current,
    isConnected: connectionStateRef.current === 'connected',
    connect,
    disconnect,
  };
}
