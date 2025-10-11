/**
 * API 模組：Grafana 平台整合 (specs/006-platform-grafana)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchPlatformGrafanaList() {
  return apiClient<unknown>('/platform-grafana', { method: 'GET' });
}

export async function createPlatformGrafana(payload: unknown) {
  return apiClient<unknown>('/platform-grafana', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
