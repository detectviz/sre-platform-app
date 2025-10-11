/**
 * API 模組：使用者個人設定 (specs/015-user-profile)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchUserProfileList() {
  return apiClient<unknown>('/user-profile', { method: 'GET' });
}

export async function createUserProfile(payload: unknown) {
  return apiClient<unknown>('/user-profile', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
