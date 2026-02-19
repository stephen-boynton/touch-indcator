import type { FC } from 'react';
import { useTouchSender } from '../hooks/useTouchSender';
import type { TouchIndicatorConnection } from '../types';

export interface TouchSenderProps extends TouchIndicatorConnection {
  disabled?: boolean;
}

export const TouchSender: FC<TouchSenderProps> = ({
  wsUrl = 'ws://localhost:8080/ws',
  onConnect,
  onDisconnect,
  onError,
  disabled = false,
}) => {
  useTouchSender({
    wsUrl,
    onConnect,
    onDisconnect,
    onError,
    disabled,
  });

  return null;
};
