import { describe, test, expect } from 'bun:test';
import { getPositionStyle, getIndicatorStyle, getRippleStyle } from './index';

describe('getPositionStyle', () => {
  const baseOptions = {
    position: { x: 100, y: 200 },
    isVisible: true,
    isTapping: false,
    visual: { size: 50, color: 'red', opacity: 0.8 },
    animation: { transitionDuration: 150, pulseScale: 1.2, pulseDuration: 100, rippleScale: 2 },
  };

  test('returns empty style when not visible', () => {
    const result = getPositionStyle({ ...baseOptions, isVisible: false });

    expect(result).toEqual({
      opacity: 0,
      transition: 'opacity 150ms ease-out',
    });
  });

  test('returns fixed position when visible', () => {
    const result = getPositionStyle(baseOptions);

    expect(result.position).toBe('fixed');
    expect(result.left).toBe(100);
    expect(result.top).toBe(200);
  });

  test('applies pulse transform when tapping', () => {
    const result = getPositionStyle({ ...baseOptions, isTapping: true });

    expect(result.transform).toBe('translate(-50%, -50%) scale(1.2)');
    expect(result.transition).toBe('transform 100ms ease-out');
  });

  test('applies normal transform when not tapping', () => {
    const result = getPositionStyle({ ...baseOptions, isTapping: false });

    expect(result.transform).toBe('translate(-50%, -50%) scale(1)');
    expect(result.transition).toBe('all 150ms ease-out');
  });

  test('returns none transition when transitionDuration is 0', () => {
    const result = getPositionStyle({
      ...baseOptions,
      animation: { ...baseOptions.animation, transitionDuration: 0 },
    });

    expect(result.transition).toBe('none');
  });

  test('applies visual opacity', () => {
    const result = getPositionStyle(baseOptions);

    expect(result.opacity).toBe(0.8);
  });
});

describe('getIndicatorStyle', () => {
  const baseOptions = {
    positionStyle: { left: 100, top: 200 } as React.CSSProperties,
    visual: { size: 50, color: 'blue' },
    connectionState: 'connected' as const,
    isTapping: false,
  };

  test('merges positionStyle with visual properties', () => {
    const result = getIndicatorStyle(baseOptions);

    expect(result.left).toBe(100);
    expect(result.top).toBe(200);
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
    expect(result.borderRadius).toBe('50%');
    expect(result.backgroundColor).toBe('blue');
    expect(result.pointerEvents).toBe('none');
    expect(result.willChange).toBe('left, top, opacity, transform');
  });

  test('allows custom style overrides', () => {
    const result = getIndicatorStyle({
      ...baseOptions,
      style: { zIndex: 100 },
    });

    expect(result.zIndex).toBe(100);
  });
});

describe('getRippleStyle', () => {
  test('returns fixed position with ripple properties', () => {
    const result = getRippleStyle({
      position: { x: 150, y: 250 },
      visual: { size: 60, color: 'rgba(255,0,0,0.3)' },
      animation: { rippleScale: 2.5, rippleDuration: 300 },
    });

    expect(result.position).toBe('fixed');
    expect(result.left).toBe(150);
    expect(result.top).toBe(250);
    expect(result.width).toBe(60);
    expect(result.height).toBe(60);
    expect(result.borderRadius).toBe('50%');
    expect(result.backgroundColor).toBe('rgba(255,0,0,0.3)');
    expect(result['--ripple-scale' as keyof typeof result]).toBe(2.5);
    expect(result['--ripple-duration' as keyof typeof result]).toBe('300ms');
  });
});
