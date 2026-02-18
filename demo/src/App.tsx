import { useState, useEffect, useRef, useCallback } from 'react';
import { TouchIndicator, useTouchIndicator } from 'touch-indicator';
import './App.css';

type Mode = 'display' | 'sender';

const getDefaultWsUrl = () => {
  const hostname = window.location.hostname;
  return `ws://${hostname}:8080/ws`;
};

function App() {
  const [wsUrl, setWsUrl] = useState(getDefaultWsUrl());
  const [showIndicator, setShowIndicator] = useState(true);
  const [mode, setMode] = useState<Mode>('display');
  const wsRef = useRef<WebSocket | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const { connectionState, lastMessage, connect, disconnect } = useTouchIndicator({
    wsUrl,
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onError: error => console.error('WebSocket error:', error),
  });

  const sendTouch = useCallback((phase: 'start' | 'move' | 'tap', dx: number, dy: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          phase,
          dx,
          dy,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (mode === 'sender') {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => console.log('Sender connected');
      wsRef.current.onclose = () => console.log('Sender disconnected');

      return () => {
        wsRef.current?.close();
      };
    }
  }, [mode, wsUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode !== 'sender') return;
    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    sendTouch('tap', 0, 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (mode !== 'sender') return;
    const touch = e.touches[0];

    if (lastTouchRef.current) {
      const dx = touch.clientX - lastTouchRef.current.x;
      const dy = touch.clientY - lastTouchRef.current.y;
      sendTouch('move', dx, dy);
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleReconnect = () => {
    disconnect();
    setTimeout(() => connect(), 100);
  };

  return (
    <div className={`app ${mode}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
      <header className="header">
        <h1>Touch Indicator Demo</h1>
        <p>
          {mode === 'display'
            ? 'Connect to a WebSocket server sending touch data'
            : 'Drag your finger to send touch events'}
        </p>
      </header>

      <main className="main">
        <div className="controls">
          <div className="control-group">
            <label htmlFor="ws-url">WebSocket URL:</label>
            <input
              id="ws-url"
              type="text"
              value={wsUrl}
              onChange={e => setWsUrl(e.target.value)}
              placeholder="ws://[hostname]:8080/ws"
            />
          </div>

          <div className="control-group">
            <label htmlFor="mode-select">Mode:</label>
            <select id="mode-select" value={mode} onChange={e => setMode(e.target.value as Mode)}>
              <option value="display">Display (receive touches)</option>
              <option value="sender">Sender (send touches)</option>
            </select>
          </div>

          {mode === 'display' && (
            <>
              <div className="control-group">
                <label>
                  <input
                    type="checkbox"
                    checked={showIndicator}
                    onChange={e => setShowIndicator(e.target.checked)}
                  />
                  Show Touch Indicator
                </label>
              </div>

              <div className="status">
                <span className={`status-indicator ${connectionState}`}></span>
                <span>Status: {connectionState}</span>
              </div>

              <button onClick={handleReconnect}>Reconnect</button>
            </>
          )}

          {mode === 'sender' && (
            <div className="status">
              <span
                className={`status-indicator ${wsRef.current?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'}`}
              ></span>
              <span>
                Status:{' '}
                {wsRef.current?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'}
              </span>
            </div>
          )}
        </div>

        {mode === 'sender' && (
          <div className="debug-info">
            <h3>Instructions:</h3>
            <p>
              Drag your finger anywhere on this screen to send touch events to the WebSocket server.
            </p>
          </div>
        )}
      </main>

      {mode === 'display' && showIndicator && (
        <TouchIndicator wsUrl={wsUrl} message={lastMessage} connectionState={connectionState} />
      )}
    </div>
  );
}

export default App;
