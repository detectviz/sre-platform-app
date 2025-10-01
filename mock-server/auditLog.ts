import { DB } from './db';
import { uuidv4 } from './db';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  changes: any;
}

/**
 * Audit log middleware to record all important operations
 * @param userId - ID of the user performing the action
 * @param action - Type of action (CREATE, UPDATE, DELETE, etc.)
 * @param entityType - Type of entity being modified
 * @param entityId - ID of the entity being modified
 * @param details - Additional details about the changes
 */
export const auditLogMiddleware = (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: any
): void => {
  // Find user name from DB
  const userName = getUserNameById(userId);

  // Create audit log entry
  const log: AuditLogEntry = {
    id: `audit-${uuidv4()}`,
    userId,
    userName,
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1', // Mock IP address for the mock server
    changes: details || {}
  };

  // Add to audit logs
  DB.auditLogs.unshift(log);
};

// Helper to get user name by ID
const getUserNameById = (userId: string): string => {
  const user = DB.users.find((u: any) => u.id === userId);
  return user ? user.name : 'Unknown User';
};
