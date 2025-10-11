import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchDashboards() {
  const start = performance.now();
  const data = await apiClient.request('/dashboards', { method: 'GET' });
  metrics.apiLatency('/dashboards', performance.now() - start, { module: 'dashboards/dashboards-management' });
  return data;
}

export async function fetchDashboardDefinitions() {
  const start = performance.now();
  const data = await apiClient.request('/dashboards/definitions', { method: 'GET' });
  metrics.apiLatency('/dashboards/definitions', performance.now() - start, { module: 'dashboards/dashboards-management' });
  return data;
}
