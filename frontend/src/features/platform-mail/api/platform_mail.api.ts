/**
 * API 模組：郵件通知管理 (specs/004-platform-mail)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchPlatformMailList() {
  return apiClient<unknown>('/platform-mail', { method: 'GET' });
}

export async function createPlatformMail(payload: unknown) {
  return apiClient<unknown>('/platform-mail', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
