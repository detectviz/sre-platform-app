/**
 * API 模組：平台設定 (specs/001-platform-auth)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchSettingsList() {
  return apiClient<unknown>('/settings', { method: 'GET' });
}

export async function createSettings(payload: unknown) {
  return apiClient<unknown>('/settings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
