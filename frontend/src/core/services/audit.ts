import { loggingService } from './logging';
import { OBSERVABILITY_EVENTS } from '../constants/events';

export interface AuditRecord {
  actor: string;
  action: string;
  resource: string;
  tenantId: string;
  result: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}

export const auditService = {
  record: (audit: AuditRecord) => {
    loggingService.info('Audit event recorded', {
      event: OBSERVABILITY_EVENTS.audit,
      ...audit
    });
  }
};
