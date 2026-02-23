import { useEffect, useRef, useCallback, useState } from 'react';
import type { ConnectionState, TouchMessage, TouchPhase } from '../types';
import { createLogger } from '../lib';

const logger = createLogger('TouchIndicator:WS');

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

  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);
  const reconnectAttemptsRef = useRef(reconnectAttempts);
  const reconnectIntervalRef = useRef(reconnectInterval);

  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
    reconnectAttemptsRef.current = reconnectAttempts;
    reconnectIntervalRef.current = reconnectInterval;
  }, [onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval]);

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

    logger.debug('Connecting to', wsUrl);
    updateState('connecting', lastMessageRef.current);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info('Connected to', wsUrl);
        reconnectCountRef.current = 0;
        updateState('connected', lastMessageRef.current);
        onConnectRef.current?.();
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          const message = parseMessage(data);

          if (message) {
            logger.debug('Received message:', message);
            updateState(connectionStateRef.current, message);
          }
        } catch {
          logger.debug('Invalid touch data received');
        }
      };

      ws.onerror = error => {
        logger.error('WebSocket error:', error);
        onErrorRef.current?.(error);
      };

      ws.onclose = () => {
        logger.debug('WebSocket closed');
        updateState('disconnected', lastMessageRef.current);
        onDisconnectRef.current?.();

        if (reconnectCountRef.current < reconnectAttemptsRef.current) {
          reconnectCountRef.current++;
          const delay = reconnectIntervalRef.current * Math.pow(2, reconnectCountRef.current - 1);
          logger.debug(
            `Reconnecting (attempt ${reconnectCountRef.current}/${reconnectAttemptsRef.current}) in ${delay}ms`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          logger.error('Max reconnection attempts reached');
          updateState('error', lastMessageRef.current);
        }
      };
    } catch {
      logger.error('Failed to create WebSocket');
      updateState('error', lastMessageRef.current);
    }
  }, [wsUrl, updateState]);

  const disconnect = useCallback(() => {
    logger.debug('Disconnecting');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectCountRef.current = reconnectAttemptsRef.current;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateState('disconnected', null);
  }, [updateState]);

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
