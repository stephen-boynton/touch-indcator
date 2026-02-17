import { useTouchIndicator } from '../hooks/useTouchIndicator';
import type { ConnectionState } from '../types';

interface TouchIndicatorProps {
  wsUrl: string;
  className?: string;
  style?: React.CSSProperties;
}

export function TouchIndicator({ wsUrl, className, style }: TouchIndicatorProps) {
  const { connectionState, lastTouch } = useTouchIndicator({ wsUrl });

  const positionStyle: React.CSSProperties = lastTouch
    ? {
        position: 'fixed' as const,
        left: lastTouch.x,
        top: lastTouch.y,
        transform: 'translate(-50%, -50%)',
      }
    : {};

  return (
    <div
      className={className}
      style={{
        ...style,
        ...positionStyle,
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none',
      }}
      data-connection-state={connectionState}
    />
  );
}
