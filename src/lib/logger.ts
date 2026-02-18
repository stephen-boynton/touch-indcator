/* eslint-disable no-console */
export type Logger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
};

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  DEBUG = 'debug',
}

let debugEnabled =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV !== 'production' &&
  process.env.DEBUG === 'true';

export const setDebugEnabled = (enabled: boolean): void => {
  debugEnabled = enabled;
};

const timestamp = (): string => new Date().toISOString();

const formatPrefix = (namespace?: string, level?: LogLevel): string => {
  const ns = namespace ? `[${namespace}] ` : '';
  const lvl = level ? `[${level}] ` : '';
  return `${timestamp()} ${lvl}${ns}`;
};

export const createLogger = (namespace?: string): Logger => {
  const prefix = (level?: LogLevel) => formatPrefix(namespace, level);

  const info = (...args: unknown[]): void => {
    console.info(prefix(LogLevel.INFO), ...args);
  };

  const error = (...args: unknown[]): void => {
    console.error(prefix(LogLevel.ERROR), ...args);
  };

  const debug = (...args: unknown[]): void => {
    if (!debugEnabled) return;
    // Prefer console.debug when available; fall back to console.log
    const fn = console.debug ?? console.log;
    fn(prefix(LogLevel.DEBUG), ...args);
  };

  return { info, error, debug };
};
