/**
 * API 模組：身份驗證管理 (specs/001-platform-auth)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchPlatformAuthList() {
  return apiClient<unknown>('/platform-auth', { method: 'GET' });
}

export async function createPlatformAuth(payload: unknown) {
  return apiClient<unknown>('/platform-auth', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
