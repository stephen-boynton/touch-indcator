import type { TouchData } from '../types';

export function isValidTouchData(data: unknown): data is TouchData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.x === 'number' &&
    typeof obj.y === 'number' &&
    typeof obj.timestamp === 'number' &&
    (obj.pressure === undefined || typeof obj.pressure === 'number') &&
    (obj.touchId === undefined || typeof obj.touchId === 'number')
  );
}

export function normalizeCoordinates(
  x: number,
  y: number,
  bounds: { width: number; height: number }
): { normalizedX: number; normalizedY: number } {
  return {
    normalizedX: Math.max(0, Math.min(x, bounds.width)),
    normalizedY: Math.max(0, Math.min(y, bounds.height)),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateDistance(touch1: TouchData, touch2: TouchData): number {
  const dx = touch2.x - touch1.x;
  const dy = touch2.y - touch1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateVelocity(touch1: TouchData, touch2: TouchData): number {
  const dx = touch2.x - touch1.x;
  const dy = touch2.y - touch1.y;
  const dt = touch2.timestamp - touch1.timestamp;

  if (dt === 0) {
    return 0;
  }

  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance / dt;
}
