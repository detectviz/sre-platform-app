/**
 * API 模組：事件列表 (specs/011-incident-list)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchIncidentListList() {
  return apiClient<unknown>('/incident-list', { method: 'GET' });
}

export async function createIncidentList(payload: unknown) {
  return apiClient<unknown>('/incident-list', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
