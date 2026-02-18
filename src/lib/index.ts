export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applySensitivity(
  dx: number,
  dy: number,
  sensitivity: number
): { dx: number; dy: number } {
  return {
    dx: dx * sensitivity,
    dy: dy * sensitivity,
  };
}

export function clampPosition(
  x: number,
  y: number,
  bounds: { width: number; height: number },
  indicatorSize: number
): { x: number; y: number } {
  const halfSize = indicatorSize / 2;
  return {
    x: clamp(x, halfSize, bounds.width - halfSize),
    y: clamp(y, halfSize, bounds.height - halfSize),
  };
}
