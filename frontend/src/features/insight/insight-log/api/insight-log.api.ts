import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchLogInsights() {
  const start = performance.now();
  const data = await apiClient.request('/insight/logs', { method: 'GET' });
  metrics.apiLatency('/insight/logs', performance.now() - start, { module: 'insight/insight-log' });
  return data;
}
