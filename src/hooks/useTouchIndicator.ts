import { useEffect, useRef, useCallback, useState } from 'react';
import type { ConnectionState, TouchMessage, TouchPhase } from '../types';

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
  lastMessage: TouchMessage | null;
  isDragging: boolean;
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
  const lastPhaseRef = useRef<TouchPhase | null>(null);

  const connectionStateRef = useRef<ConnectionState>('disconnected');
  const lastMessageRef = useRef<TouchMessage | null>(null);

  const [, setStateTrigger] = useState(0);

  const updateState = useCallback(
    (connectionState: ConnectionState, message: TouchMessage | null) => {
      connectionStateRef.current = connectionState;
      lastMessageRef.current = message;
      if (message) {
        lastPhaseRef.current = message.phase;
      }
      setStateTrigger(n => n + 1);
    },
    []
  );

  const parseMessage = (data: unknown): TouchMessage | null => {
    if (typeof data !== 'object' || data === null) {
      return null;
    }

    const obj = data as Record<string, unknown>;

    const phase = obj.phase as TouchPhase | undefined;
    if (!phase || !['start', 'move', 'tap'].includes(phase)) {
      return null;
    }

    const dx = obj.dx as number | undefined;
    const dy = obj.dy as number | undefined;

    if (typeof dx !== 'number' || typeof dy !== 'number') {
      return null;
    }

    return { phase, dx, dy };
  };

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    updateState('connecting', lastMessageRef.current);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectCountRef.current = 0;
        updateState('connected', lastMessageRef.current);
        onConnect?.();
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          const message = parseMessage(data);

          if (message) {
            updateState(connectionStateRef.current, message);
          }
        } catch {
          console.warn('Invalid touch data received');
        }
      };

      ws.onerror = error => {
        onError?.(error);
      };

      ws.onclose = () => {
        updateState('disconnected', lastMessageRef.current);
        onDisconnect?.();

        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          const delay = reconnectInterval * Math.pow(2, reconnectCountRef.current - 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          updateState('error', lastMessageRef.current);
        }
      };
    } catch {
      updateState('error', lastMessageRef.current);
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

  const isDragging = lastMessageRef.current?.phase === 'move';

  return {
    connectionState: connectionStateRef.current,
    lastMessage: lastMessageRef.current,
    isDragging,
    connect,
    disconnect,
  };
}
