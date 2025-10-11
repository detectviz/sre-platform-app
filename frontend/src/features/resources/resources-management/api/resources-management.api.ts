import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchResources() {
  const start = performance.now();
  const data = await apiClient.request('/resources', { method: 'GET' });
  metrics.apiLatency('/resources', performance.now() - start, { module: 'resources/resources-management' });
  return data;
}

export async function fetchResourceGroups() {
  const start = performance.now();
  const data = await apiClient.request('/resources/groups', { method: 'GET' });
  metrics.apiLatency('/resources/groups', performance.now() - start, { module: 'resources/resources-management' });
  return data;
}

export async function triggerAutoDiscovery() {
  const start = performance.now();
  const data = await apiClient.request('/resources/auto-discovery', { method: 'POST' });
  metrics.apiLatency('/resources/auto-discovery', performance.now() - start, { module: 'resources/resources-management' });
  return data;
}
