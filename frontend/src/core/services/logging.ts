import { DateTime } from '@grafana/data';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface LogPayload {
  module: string;
  scope?: string;
  tenantId?: string;
  context?: Record<string, unknown>;
}

function emit(level: LogLevel, message: string, payload: LogPayload) {
  const timestamp = DateTime.now().toISOString();
  // TODO: integrate with Loki / Grafana logging pipeline
  console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log']('[SRE]', {
    level,
    message,
    timestamp,
    ...payload,
  });
}

export const logging = {
  trace(message: string, payload: LogPayload) {
    emit('trace', message, payload);
  },
  debug(message: string, payload: LogPayload) {
    emit('debug', message, payload);
  },
  info(message: string, payload: LogPayload) {
    emit('info', message, payload);
  },
  warn(message: string, payload: LogPayload) {
    emit('warn', message, payload);
  },
  error(message: string, payload: LogPayload) {
    emit('error', message, payload);
  },
};
