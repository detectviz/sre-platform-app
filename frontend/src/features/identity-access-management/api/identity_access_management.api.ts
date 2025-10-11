/**
 * API 模組：身分與存取管理 (specs/002-identity-access-management)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchIdentityAccessManagementList() {
  return apiClient<unknown>('/iam', { method: 'GET' });
}

export async function createIdentityAccessManagement(payload: unknown) {
  return apiClient<unknown>('/iam', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
