/**
 * API 模組：通知管理 (specs/012-notification-management)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchNotificationManagementList() {
  return apiClient<unknown>('/notification-management', { method: 'GET' });
}

export async function createNotificationManagement(payload: unknown) {
  return apiClient<unknown>('/notification-management', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
