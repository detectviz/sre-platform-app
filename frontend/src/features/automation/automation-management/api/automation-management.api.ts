import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchPlaybooks() {
  const start = performance.now();
  const data = await apiClient.request('/automation/playbooks', { method: 'GET' });
  metrics.apiLatency('/automation/playbooks', performance.now() - start, { module: 'automation/automation-management' });
  return data;
}

export async function fetchAutomationTriggers() {
  const start = performance.now();
  const data = await apiClient.request('/automation/triggers', { method: 'GET' });
  metrics.apiLatency('/automation/triggers', performance.now() - start, { module: 'automation/automation-management' });
  return data;
}

export async function fetchAutomationHistory() {
  const start = performance.now();
  const data = await apiClient.request('/automation/history', { method: 'GET' });
  metrics.apiLatency('/automation/history', performance.now() - start, { module: 'automation/automation-management' });
  return data;
}
