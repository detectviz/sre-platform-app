/**
 * API 模組：儀表板管理 (specs/014-dashboards-management)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchDashboardsManagementList() {
  return apiClient<unknown>('/dashboards-management', { method: 'GET' });
}

export async function createDashboardsManagement(payload: unknown) {
  return apiClient<unknown>('/dashboards-management', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
