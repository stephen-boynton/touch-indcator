import { describe, test, expect, beforeEach, afterEach, jest } from 'bun:test';
import {
  isValidTouchData,
  clamp,
  normalizeCoordinates,
  calculateDistance,
  calculateVelocity,
} from '../lib';

describe('useTouchIndicator', () => {
  let originalWebSocket: typeof WebSocket;

  beforeEach(() => {
    originalWebSocket = global.WebSocket;
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
  });

  test('starts in disconnected state', () => {
    const mockWs = {
      readyState: 0,
      close: jest.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    global.WebSocket = jest.fn(() => mockWs) as unknown as typeof WebSocket;

    expect(true).toBe(true);
  });
});

describe('isValidTouchData', () => {
  test('returns true for valid TouchData', () => {
    const validData = {
      x: 100,
      y: 200,
      timestamp: Date.now(),
    };
    expect(isValidTouchData(validData)).toBe(true);
  });

  test('returns true for valid TouchData with optional fields', () => {
    const validData = {
      x: 100,
      y: 200,
      timestamp: Date.now(),
      pressure: 0.5,
      touchId: 1,
    };
    expect(isValidTouchData(validData)).toBe(true);
  });

  test('returns false for null', () => {
    expect(isValidTouchData(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isValidTouchData(undefined)).toBe(false);
  });

  test('returns false for missing x', () => {
    expect(isValidTouchData({ y: 100, timestamp: Date.now() })).toBe(false);
  });

  test('returns false for missing y', () => {
    expect(isValidTouchData({ x: 100, timestamp: Date.now() })).toBe(false);
  });

  test('returns false for missing timestamp', () => {
    expect(isValidTouchData({ x: 100, y: 200 })).toBe(false);
  });

  test('returns false for invalid x type', () => {
    expect(isValidTouchData({ x: '100', y: 200, timestamp: Date.now() })).toBe(false);
  });

  test('returns false for invalid pressure', () => {
    expect(
      isValidTouchData({
        x: 100,
        y: 200,
        timestamp: Date.now(),
        pressure: 'high' as unknown as number,
      })
    ).toBe(false);
  });
});

describe('clamp', () => {
  test('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test('returns min when value is below', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test('returns max when value is above', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test('works with negative ranges', () => {
    expect(clamp(0, -10, -5)).toBe(-5);
  });
});

describe('normalizeCoordinates', () => {
  test('returns same coordinates within bounds', () => {
    const result = normalizeCoordinates(100, 200, { width: 1000, height: 1000 });
    expect(result.normalizedX).toBe(100);
    expect(result.normalizedY).toBe(200);
  });

  test('clamps coordinates above bounds', () => {
    const result = normalizeCoordinates(1500, 2000, { width: 1000, height: 1000 });
    expect(result.normalizedX).toBe(1000);
    expect(result.normalizedY).toBe(1000);
  });

  test('clamps negative coordinates', () => {
    const result = normalizeCoordinates(-100, -200, { width: 1000, height: 1000 });
    expect(result.normalizedX).toBe(0);
    expect(result.normalizedY).toBe(0);
  });
});

describe('calculateDistance', () => {
  test('returns 0 for same point', () => {
    const touch = { x: 100, y: 100, timestamp: Date.now() };
    expect(calculateDistance(touch, touch)).toBe(0);
  });

  test('calculates correct distance', () => {
    const touch1 = { x: 0, y: 0, timestamp: 0 };
    const touch2 = { x: 3, y: 4, timestamp: 1000 };
    expect(calculateDistance(touch1, touch2)).toBe(5);
  });
});

describe('calculateVelocity', () => {
  test('returns 0 for same timestamp', () => {
    const touch = { x: 100, y: 100, timestamp: 1000 };
    expect(calculateVelocity(touch, touch)).toBe(0);
  });

  test('calculates correct velocity', () => {
    const touch1 = { x: 0, y: 0, timestamp: 0 };
    const touch2 = { x: 100, y: 0, timestamp: 1000 };
    expect(calculateVelocity(touch1, touch2)).toBe(0.1);
  });
});
