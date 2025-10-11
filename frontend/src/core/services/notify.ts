import { Subject } from 'rxjs';

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

export interface NotificationEvent {
  id: string;
  message: string;
  severity: NotificationSeverity;
  module: string;
  source?: string;
  timestamp: string;
}

const stream = new Subject<NotificationEvent>();

export const notify = {
  stream,
  push(event: Omit<NotificationEvent, 'timestamp'>) {
    const payload: NotificationEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    stream.next(payload);
  },
};
