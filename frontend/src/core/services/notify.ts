import { OBSERVABILITY_EVENTS } from '../constants/events';
import { loggingService } from './logging';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationPayload {
  message: string;
  severity: NotificationSeverity;
  source?: string;
  context?: Record<string, unknown>;
}

export const notifyService = {
  publish: ({ message, severity, source, context }: NotificationPayload) => {
    loggingService.info('Notification emitted', {
      event: OBSERVABILITY_EVENTS.notification,
      severity,
      source,
      context
    });
    // Integrate Grafana's appEvents bus in future implementation.
  }
};
