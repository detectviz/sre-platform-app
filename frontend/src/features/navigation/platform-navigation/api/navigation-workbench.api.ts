import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchNavigationExperiments() {
  const start = performance.now();
  const data = await apiClient.request('/navigation/experiments', { method: 'GET' });
  metrics.apiLatency('/navigation/experiments', performance.now() - start, { module: 'navigation/platform-navigation' });
  return data;
}
