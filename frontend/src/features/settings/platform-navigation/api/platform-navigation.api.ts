import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchNavigationTree() {
  const start = performance.now();
  const data = await apiClient.request('/platform/navigation/tree', { method: 'GET' });
  metrics.apiLatency('/platform/navigation/tree', performance.now() - start, { module: 'settings/platform-navigation' });
  return data;
}

export async function saveNavigationTree() {
  const start = performance.now();
  const data = await apiClient.request('/platform/navigation/tree', { method: 'POST' });
  metrics.apiLatency('/platform/navigation/tree', performance.now() - start, { module: 'settings/platform-navigation' });
  return data;
}
