/**
 * API 模組：自動化管理 (specs/013-automation-management)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchAutomationManagementList() {
  return apiClient<unknown>('/automation-management', { method: 'GET' });
}

export async function createAutomationManagement(payload: unknown) {
  return apiClient<unknown>('/automation-management', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
