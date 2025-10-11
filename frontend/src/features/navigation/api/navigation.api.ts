/**
 * API 模組：導覽模組 (specs/003-platform-navigation)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchNavigationList() {
  return apiClient<unknown>('/navigation', { method: 'GET' });
}

export async function createNavigation(payload: unknown) {
  return apiClient<unknown>('/navigation', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
