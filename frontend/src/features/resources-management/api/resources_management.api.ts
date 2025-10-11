/**
 * API 模組：資源管理 (specs/007-resources-management)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchResourcesManagementList() {
  return apiClient<unknown>('/resources', { method: 'GET' });
}

export async function createResourcesManagement(payload: unknown) {
  return apiClient<unknown>('/resources', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
