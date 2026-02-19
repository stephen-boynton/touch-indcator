import { useEffect, useRef, useCallback, useState } from 'react';
import type { TouchPhase } from '../types';
import { createLogger } from '../lib';

const logger = createLogger('TouchIndicator:Sender');

export interface UseTouchSenderOptions {
  wsUrl: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  disabled?: boolean;
}

export interface UseTouchSenderReturn {
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  connect: () => void;
  disconnect: () => void;
}

export function useTouchSender(options: UseTouchSenderOptions): UseTouchSenderReturn {
  const { wsUrl, onConnect, onDisconnect, onError, disabled = false } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number | null>(null);
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');

  const sendMessage = useCallback((phase: TouchPhase, dx: number, dy: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ phase, dx, dy }));
      logger.debug(`Sent: ${phase}`, { dx, dy });
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    logger.debug('Connecting to', wsUrl);
    setConnectionState('connecting');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info('Connected to', wsUrl);
        setConnectionState('connected');
        onConnect?.();
      };

      ws.onerror = error => {
        logger.error('WebSocket error:', error);
        setConnectionState('error');
        onError?.(error);
      };

      ws.onclose = () => {
        logger.debug('WebSocket closed');
        setConnectionState('disconnected');
        onDisconnect?.();
      };
    } catch {
      logger.error('Failed to create WebSocket');
      setConnectionState('error');
    }
  }, [wsUrl, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    logger.debug('Disconnecting');
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    lastTouchRef.current = null;
    setConnectionState('disconnected');
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      if (!touch) return;

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      touchStartTimeRef.current = Date.now();
      sendMessage('start', 0, 0);
    },
    [disabled, sendMessage]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      const touch = e.touches[0];
      if (!touch || !lastTouchRef.current) return;

      const dx = touch.clientX - lastTouchRef.current.x;
      const dy = touch.clientY - lastTouchRef.current.y;
      sendMessage('move', dx, dy);
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [disabled, sendMessage]
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;

    sendMessage('tap', 0, 0);

    lastTouchRef.current = null;
    touchStartTimeRef.current = null;
  }, [disabled, sendMessage]);

  useEffect(() => {
    if (disabled) {
      disconnect();
      return;
    }

    connect();

    const target = window.document.body;

    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchmove', handleTouchMove, { passive: true });
    target.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      disconnect();
    };
  }, [wsUrl, disabled]);

  return {
    connectionState,
    connect,
    disconnect,
  };
}
