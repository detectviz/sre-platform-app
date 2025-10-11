/**
 * API 模組：標籤系統管理 (specs/005-platform-tag)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchPlatformTagList() {
  return apiClient<unknown>('/platform-tag', { method: 'GET' });
}

export async function createPlatformTag(payload: unknown) {
  return apiClient<unknown>('/platform-tag', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
