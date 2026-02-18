import { describe, test, expect } from 'bun:test';

describe('TouchIndicator lib utilities', () => {
  describe('applySensitivity', () => {
    test('multiplies dx and dy by sensitivity', async () => {
      const { applySensitivity } = await import('../lib');

      const result = applySensitivity(10, 20, 2);

      expect(result).toEqual({ dx: 20, dy: 40 });
    });

    test('handles sensitivity of 1', async () => {
      const { applySensitivity } = await import('../lib');

      const result = applySensitivity(5, 10, 1);

      expect(result).toEqual({ dx: 5, dy: 10 });
    });

    test('handles fractional sensitivity', async () => {
      const { applySensitivity } = await import('../lib');

      const result = applySensitivity(10, 20, 0.5);

      expect(result).toEqual({ dx: 5, dy: 10 });
    });

    test('handles negative values', async () => {
      const { applySensitivity } = await import('../lib');

      const result = applySensitivity(-10, 20, 1.5);

      expect(result).toEqual({ dx: -15, dy: 30 });
    });
  });

  describe('clamp', () => {
    test('returns value when within range', async () => {
      const { clamp } = await import('../lib');

      expect(clamp(5, 0, 10)).toBe(5);
    });

    test('returns min when value is below range', async () => {
      const { clamp } = await import('../lib');

      expect(clamp(-5, 0, 10)).toBe(0);
    });

    test('returns max when value is above range', async () => {
      const { clamp } = await import('../lib');

      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('clampPosition', () => {
    test('returns original position when within bounds', async () => {
      const { clampPosition } = await import('../lib');

      const result = clampPosition(100, 200, { width: 1000, height: 800 }, 20);

      expect(result).toEqual({ x: 100, y: 200 });
    });

    test('clamps x to left boundary', async () => {
      const { clampPosition } = await import('../lib');

      const result = clampPosition(5, 200, { width: 1000, height: 800 }, 20);

      expect(result).toEqual({ x: 10, y: 200 });
    });

    test('clamps x to right boundary', async () => {
      const { clampPosition } = await import('../lib');

      const result = clampPosition(995, 200, { width: 1000, height: 800 }, 20);

      expect(result).toEqual({ x: 990, y: 200 });
    });

    test('clamps y to top boundary', async () => {
      const { clampPosition } = await import('../lib');

      const result = clampPosition(100, 5, { width: 1000, height: 800 }, 20);

      expect(result).toEqual({ x: 100, y: 10 });
    });

    test('clamps y to bottom boundary', async () => {
      const { clampPosition } = await import('../lib');

      const result = clampPosition(100, 795, { width: 1000, height: 800 }, 20);

      expect(result).toEqual({ x: 100, y: 790 });
    });
  });
});
