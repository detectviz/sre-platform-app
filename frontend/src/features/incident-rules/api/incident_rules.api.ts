/**
 * API 模組：事件規則 (specs/010-incident-rules)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchIncidentRulesList() {
  return apiClient<unknown>('/incident-rules', { method: 'GET' });
}

export async function createIncidentRules(payload: unknown) {
  return apiClient<unknown>('/incident-rules', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
