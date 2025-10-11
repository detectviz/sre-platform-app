import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchIncidents() {
  const start = performance.now();
  const data = await apiClient.request('/incidents', { method: 'GET' });
  metrics.apiLatency('/incidents', performance.now() - start, { module: 'incidents/incident-list' });
  return data;
}
