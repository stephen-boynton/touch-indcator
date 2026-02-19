# Touch Indicator

A React library for displaying a touch indicator that mimics Apple's Magic Trackpad behavior. Receive touch data via WebSocket or provide your own external data source.

![Touch Indicator Demo](https://via.placeholder.com/800x400/2196F3/ffffff?text=Touch+Indicator+Demo)

## Features

- **Magic Trackpad-like visual** - Circular touch indicator that follows finger movement
- **WebSocket or External Source** - Auto-connect to a WebSocket server or provide your own touch data
- **Configurable Appearance** - Customize size, color, and opacity
- **Animation Effects** - Pulse on tap, ripple effect on touch
- **Sensitivity Adjustment** - Scale movement for different trackpad sensitivities
- **Connection State Handling** - Visual feedback for connecting, connected, disconnected, and error states
- **Callbacks** - Handle tap and move events for custom functionality
- **TypeScript Support** - Full TypeScript support with type definitions

## Installation

```bash
bun add touch-indicator
# or
npm install touch-indicator
```

## Quick Start

### WebSocket Mode

Automatically connects to a WebSocket server:

```tsx
import { TouchIndicator } from 'touch-indicator';

function App() {
  return <TouchIndicator connection={{ wsUrl: 'ws://localhost:8080/ws' }} />;
}
```

### External Source Mode

Provide your own touch data:

```tsx
import { TouchIndicator, useTouchIndicator } from 'touch-indicator';

function App() {
  const { connectionState, lastMessage } = useTouchIndicator({
    wsUrl: 'ws://localhost:8080/ws',
  });

  return <TouchIndicator source={{ message: lastMessage, connectionState }} />;
}
```

## API Reference

### TouchIndicator Props

| Prop         | Type                                           | Default     | Description                                                              |
| ------------ | ---------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `source`     | `TouchIndicatorSource`                         | `undefined` | External message source (use instead of `connection` for manual control) |
| `connection` | `TouchIndicatorConnection`                     | `undefined` | WebSocket configuration (use for auto-connect mode)                      |
| `visual`     | `TouchIndicatorVisual`                         | See below   | Visual appearance settings                                               |
| `animation`  | `TouchIndicatorAnimation`                      | See below   | Animation configuration                                                  |
| `onTap`      | `() => void`                                   | `undefined` | Callback fired on tap                                                    |
| `onMove`     | `(position: { x: number; y: number }) => void` | `undefined` | Callback fired on move                                                   |
| `className`  | `string`                                       | `undefined` | Additional CSS class                                                     |
| `style`      | `React.CSSProperties`                          | `undefined` | Additional inline styles                                                 |
| `show`       | `boolean`                                      | `true`      | Whether to show the indicator                                            |
| `disabled`   | `boolean`                                      | `false`     | Disable the indicator                                                    |

### TouchIndicatorSource

```ts
interface TouchIndicatorSource {
  message?: TouchMessage | null;
  connectionState?: ConnectionState;
}
```

### TouchIndicatorConnection

```ts
interface TouchIndicatorConnection {
  wsUrl?: string; // WebSocket URL (default: 'ws://localhost:8080')
  reconnectAttempts?: number; // Max reconnection attempts
  reconnectInterval?: number; // Reconnection interval in ms
  onConnect?: () => void; // Called when connected
  onDisconnect?: () => void; // Called when disconnected
  onError?: (error: Event) => void; // Called on WebSocket error
}
```

### TouchIndicatorVisual

```ts
interface TouchIndicatorVisual {
  size?: number; // Diameter in pixels (default: 20)
  color?: string; // Color hex (default: '#2196F3')
  opacity?: number; // Opacity 0-1 (default: 0.8)
}
```

### TouchIndicatorAnimation

```ts
interface TouchIndicatorAnimation {
  transitionDuration?: number; // CSS transition duration in ms (default: 0)
  sensitivity?: number; // Movement sensitivity multiplier (default: 1.8)
  pulseScale?: number; // Scale factor when tapping (default: 1.5)
  pulseDuration?: number; // Pulse animation duration in ms (default: 150)
  rippleScale?: number; // Ripple effect scale (default: 2.5)
  rippleDuration?: number; // Ripple animation duration in ms (default: 300)
}
```

## Examples

### Custom Appearance

```tsx
import { TouchIndicator } from 'touch-indicator';

function CustomIndicator() {
  return (
    <TouchIndicator
      visual={{
        size: 30,
        color: '#FF6B6B',
        opacity: 0.9,
      }}
    />
  );
}
```

### With Callbacks

```tsx
import { TouchIndicator } from 'touch-indicator';

function WithCallbacks() {
  const handleTap = () => {
    console.log('Tapped!');
  };

  const handleMove = position => {
    console.log(`Moved to: ${position.x}, ${position.y}`);
  };

  return (
    <TouchIndicator
      source={{ message: { phase: 'move', dx: 10, dy: 20 } }}
      onTap={handleTap}
      onMove={handleMove}
    />
  );
}
```

### Full Configuration

```tsx
import { TouchIndicator } from 'touch-indicator';

function FullConfig() {
  return (
    <TouchIndicator
      connection={{
        wsUrl: 'ws://localhost:8080/ws',
        reconnectAttempts: 5,
        reconnectInterval: 1000,
        onConnect: () => console.log('Connected'),
        onDisconnect: () => console.log('Disconnected'),
        onError: err => console.error('Error:', err),
      }}
      visual={{
        size: 25,
        color: '#4ECDC4',
        opacity: 0.85,
      }}
      animation={{
        transitionDuration: 50,
        sensitivity: 2.0,
        pulseScale: 1.3,
        pulseDuration: 200,
        rippleScale: 2.0,
        rippleDuration: 400,
      }}
      className="my-touch-indicator"
      style={{ zIndex: 9999 }}
    />
  );
}
```

### Manual Connection Control

```tsx
import { TouchIndicator, useTouchIndicator } from 'touch-indicator';

function ManualControl() {
  const { connectionState, lastMessage, connect, disconnect } = useTouchIndicator({
    wsUrl: 'ws://localhost:8080/ws',
  });

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <span>Status: {connectionState}</span>

      <TouchIndicator source={{ message: lastMessage, connectionState }} />
    </div>
  );
}
```

## WebSocket Message Format

The WebSocket server should send messages in this format:

```ts
interface TouchMessage {
  phase: 'start' | 'move' | 'tap';
  dx: number; // Delta X movement
  dy: number; // Delta Y movement
}
```

Example message:

```json
{ "phase": "move", "dx": 10, "dy": -5 }
```

## Running the Demo

Start both the WebSocket server and demo application:

```bash
bun run dev
```

This runs:

- WebSocket server on `ws://localhost:8080`
- Demo app on `http://localhost:3000`

## Additional Exports

### Hooks

```ts
import { useTouchIndicator, useTouchIndicatorTracking } from 'touch-indicator';
```

- `useTouchIndicator` - WebSocket connection management
- `useTouchIndicatorTracking` - Position tracking and state

### Utilities

```ts
import {
  clamp,
  applySensitivity,
  clampPosition,
  getPositionStyle,
  getIndicatorStyle,
  getRippleStyle,
} from 'touch-indicator';
```

- `clamp` - Clamp a value between min and max
- `applySensitivity` - Apply sensitivity multiplier to delta values
- `clampPosition` - Clamp position within bounds
- `getPositionStyle` - Generate position styles
- `getIndicatorStyle` - Generate indicator styles
- `getRippleStyle` - Generate ripple effect styles

## License

MIT
