/**
 * API 模組：日誌洞察 (specs/008-insight-log)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchInsightLogList() {
  return apiClient<unknown>('/insight-log', { method: 'GET' });
}

export async function createInsightLog(payload: unknown) {
  return apiClient<unknown>('/insight-log', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
