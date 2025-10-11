/**
 * API 模組：洞察分析 (specs/009-insight-analysis)
 */
import { apiClient } from '../../../core/services/apiClient';

export async function fetchInsightAnalysisList() {
  return apiClient<unknown>('/insight-analysis', { method: 'GET' });
}

export async function createInsightAnalysis(payload: unknown) {
  return apiClient<unknown>('/insight-analysis', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
