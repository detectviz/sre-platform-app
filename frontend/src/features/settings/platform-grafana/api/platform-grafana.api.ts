import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchGrafanaInstances() {
  const start = performance.now();
  const data = await apiClient.request('/platform/grafana/instances', { method: 'GET' });
  metrics.apiLatency('/platform/grafana/instances', performance.now() - start, { module: 'settings/platform-grafana' });
  return data;
}

export async function rotateGrafanaToken() {
  const start = performance.now();
  const data = await apiClient.request('/platform/grafana/tokens/rotate', { method: 'POST' });
  metrics.apiLatency('/platform/grafana/tokens/rotate', performance.now() - start, { module: 'settings/platform-grafana' });
  return data;
}
