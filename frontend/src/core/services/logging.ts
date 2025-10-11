export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  action?: string;
  [key: string]: unknown;
}

const levelToConsole: Record<LogLevel, keyof Console> = {
  trace: 'debug',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error'
};

const log = (level: LogLevel, message: string, context: LogContext = {}) => {
  const consoleMethod = levelToConsole[level] ?? 'log';
  const payload = { ...context, level, message, timestamp: new Date().toISOString() };
  console[consoleMethod](`[${level.toUpperCase()}] ${message}`, payload);
};

export const loggingService = {
  trace: (message: string, context?: LogContext) => log('trace', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context)
};
