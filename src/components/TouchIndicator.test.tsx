import { describe, test, expect } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

import { TouchIndicator } from './TouchIndicator';

describe('TouchIndicator', () => {
  describe('rendering', () => {
    test('renders with default props', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('data-connection-state="disconnected"');
      expect(html).toContain('data-tapping="false"');
    });

    test('renders with custom visual props', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, { visual: { size: 30, color: '#FF0000' } })
      );
      expect(html).toContain('width:30px');
      expect(html).toContain('background-color:#FF0000');
    });

    test('renders with custom size', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, { visual: { size: 50 } })
      );
      expect(html).toContain('width:50px');
      expect(html).toContain('height:50px');
    });

    test('renders with custom color', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, { visual: { color: '#00FF00' } })
      );
      expect(html).toContain('background-color:#00FF00');
    });

    test('renders with custom animation props', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, {
          animation: { transitionDuration: 100, sensitivity: 2 },
        })
      );
      expect(html).toContain('transition:opacity 100ms ease-out');
    });

    test('renders with className', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, { className: 'custom-class' })
      );
      expect(html).toContain('custom-class');
    });

    test('renders with style', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, { style: { zIndex: 9999 } })
      );
      expect(html).toContain('z-index:9999');
    });

    test('renders with show false', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator, { show: false }));
      expect(html).toContain('opacity:0');
    });

    test('renders with disabled true', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator, { disabled: true }));
      expect(html).toContain('opacity:0');
    });
  });

  describe('data attributes', () => {
    test('applies data-connection-state attribute', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('data-connection-state="disconnected"');
    });

    test('applies data-tapping attribute false when not tapping', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('data-tapping="false"');
    });
  });

  describe('external source', () => {
    test('renders with external source message', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, {
          source: { message: { phase: 'move', dx: 10, dy: 20 } },
        })
      );
      expect(html).toContain('<div');
    });

    test('renders with external source and connection state', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, {
          source: { message: { phase: 'move', dx: 10, dy: 20 }, connectionState: 'connected' },
        })
      );
      expect(html).toContain('data-connection-state="connected"');
    });
  });

  describe('callbacks', () => {
    test('renders with onTap callback without error', () => {
      const onTap = () => {};
      const html = renderToStaticMarkup(React.createElement(TouchIndicator, { onTap }));
      expect(html).toContain('<div');
    });

    test('renders with onMove callback without error', () => {
      const onMove = () => {};
      const html = renderToStaticMarkup(React.createElement(TouchIndicator, { onMove }));
      expect(html).toContain('<div');
    });
  });

  describe('visual defaults', () => {
    test('has default size of 20px', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('width:20px');
      expect(html).toContain('height:20px');
    });

    test('has default color #2196F3', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('background-color:#2196F3');
    });
  });

  describe('shape', () => {
    test('renders as circular element', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('border-radius:50%');
    });

    test('has pointer-events none', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('pointer-events:none');
    });

    test('has will-change for performance', () => {
      const html = renderToStaticMarkup(React.createElement(TouchIndicator));
      expect(html).toContain('will-change:left, top, opacity, transform');
    });
  });

  describe('position', () => {
    test('uses fixed positioning', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, {
          source: { message: { phase: 'move', dx: 10, dy: 20 } },
        })
      );
      expect(html).toContain('position:fixed');
    });

    test('uses transform for centering', () => {
      const html = renderToStaticMarkup(
        React.createElement(TouchIndicator, {
          source: { message: { phase: 'move', dx: 10, dy: 20 } },
        })
      );
      expect(html).toContain('transform:translate(-50%, -50%)');
    });
  });
});
