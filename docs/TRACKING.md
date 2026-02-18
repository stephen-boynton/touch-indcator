# Touch Tracking Philosophy

This document explains the delta-based touch tracking approach used in this library, which mimics Apple's Magic Trackpad behavior.

## The Problem: Standard Touch Mapping

In a standard touch implementation, the cursor "jumps" to the physical location of your finger. This works fine for direct manipulation (touching an element directly), but breaks down when you want trackpad-like behavior.

## The Solution: Delta-Based (Trackpad) Mode

In Trackpad Mode, your finger's absolute position on the phone screen is **irrelevant**. The only thing that matters is the **vector** (the direction and distance) of the movement.

### Key Principles

1. **Cursor Position Persists** - The "Source of Truth" for the cursor's location lives on the Receiver (Display) and not on the Controller (Phone). The cursor stays exactly where you left it.

2. **Deltas Over Coordinates** - By sending `{ dx, dy }` (deltas) instead of `{ x, y }` (coordinates), you effectively turn your phone screen into a "limitless" mousepad.

3. **Tap Does Nothing** - Tapping the screen in different places should NOT move the indicator. It should only move when the user drags their finger.

## How the "Persistence" Works

```
Finger Lifts:     Controller stops sending dx/dy updates.
                  Receiver stops updating pos state.
                  Cursor sits still.

Finger Touches:   Controller records new lastTouch position but sends 0 displacement initially.

Finger Moves:     Controller calculates distance from that new touch point.
                  Receiver adds that distance to the old cursor position.
```

## The "Clutch" Analogy

Think of it like a physical computer mouse:

1. You move the mouse to the edge of the mousepad
2. You **lift** the mouse (the cursor stays put on the screen)
3. You place the mouse back in the center of the pad
4. You move again, and the cursor picks up exactly where it was

## Sensitivity (Gain)

Since a 100px swipe on a phone is physically much shorter than 100px on a 27-inch monitor, the cursor can feel "heavy". Apply a sensitivity multiplier on the Receiver side:

```typescript
const SENSITIVITY = 1.8;

const onMessage = (data: { dx: number; dy: number }) => {
  setPos(prev => ({
    x: prev.x + data.dx * SENSITIVITY,
    y: prev.y + data.dy * SENSITIVITY,
  }));
};
```

The default sensitivity in this library is **1.8**.

## WebSocket Message Format

The controller should send messages in this format:

```json
{ "phase": "start" | "move" | "tap", "dx": number, "dy": number }
```

- **`start`**: Finger just touched the screen (no movement yet)
- **`move`**: Finger is moving (dx/dy contains the delta)
- **`tap`**: Finger touched and lifted without moving (click)

### Phase Behavior

| Phase   | Indicator Position                              |
| ------- | ----------------------------------------------- |
| `tap`   | Unchanged                                       |
| `start` | Unchanged                                       |
| `move`  | `pos + (dx * sensitivity)`, clamped to viewport |

## Tap vs Drag Detection

The Controller detects the difference between a tap and a drag:

```typescript
handleTouchStart(touch) {
  lastTouch = { x: touch.clientX, y: touch.clientY };
  send({ phase: 'tap', dx: 0, dy: 0 });
}

handleTouchMove(touch) {
  const dx = touch.clientX - lastTouch.x;
  const dy = touch.clientY - lastTouch.y;
  send({ phase: 'move', dx, dy });
  lastTouch = { x: touch.clientX, y: touch.clientY };
}
```

## Potential Gotcha: Cumulative Error

If the user moves their finger very fast, WebSocket packets can arrive out of order or get dropped. To keep it buttery smooth:

1. **Use functional state updates** - Always use `setPos(prev => ...)` instead of `setPos(newValue)` to avoid losing updates due to React's asynchronous state batching.

2. **Handle rapid movements** - The library uses refs internally to track state synchronously, ensuring no updates are lost.

## Viewport Bounds

The indicator is clamped to stay within the viewport, accounting for the indicator's size:

```typescript
const newPos = clampPosition(
  prev.x + scaledDx,
  prev.y + scaledDy,
  { width: window.innerWidth, height: window.innerHeight },
  indicatorSize
);
```

## Summary

| Aspect   | Standard Touch               | Trackpad Mode               |
| -------- | ---------------------------- | --------------------------- |
| Position | Maps to finger location      | Delta from last position    |
| Tap      | Moves cursor to tap location | No movement                 |
| Liftoff  | Cursor disappears            | Cursor stays                |
| Screen   | Limited by screen size       | Limitless (like a mousepad) |
