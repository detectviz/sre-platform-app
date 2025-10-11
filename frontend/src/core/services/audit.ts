export interface AuditRecord {
  actor: string;
  module: string;
  action: string;
  resource: string;
  tenantId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const auditTrail: AuditRecord[] = [];

export const audit = {
  record(entry: Omit<AuditRecord, 'timestamp'>) {
    const record: AuditRecord = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    auditTrail.push(record);
    console.log('[Audit]', record);
  },
  all() {
    return [...auditTrail];
  },
};
