import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchAlertRules() {
  const start = performance.now();
  const data = await apiClient.request('/incidents/rules', { method: 'GET' });
  metrics.apiLatency('/incidents/rules', performance.now() - start, { module: 'incidents/incident-rules' });
  return data;
}

export async function fetchSilenceRules() {
  const start = performance.now();
  const data = await apiClient.request('/incidents/silences', { method: 'GET' });
  metrics.apiLatency('/incidents/silences', performance.now() - start, { module: 'incidents/incident-rules' });
  return data;
}
