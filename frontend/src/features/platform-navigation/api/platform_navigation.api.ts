/**
 * API 模組：平台導覽管理 (specs/003-platform-navigation)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchPlatformNavigationList() {
  return apiClient<unknown>('/platform-navigation', { method: 'GET' });
}

export async function createPlatformNavigation(payload: unknown) {
  return apiClient<unknown>('/platform-navigation', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
