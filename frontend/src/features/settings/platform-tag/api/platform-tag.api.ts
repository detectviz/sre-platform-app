import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchTagTaxonomies() {
  const start = performance.now();
  const data = await apiClient.request('/platform/tag/taxonomies', { method: 'GET' });
  metrics.apiLatency('/platform/tag/taxonomies', performance.now() - start, { module: 'settings/platform-tag' });
  return data;
}

export async function syncTagPolicies() {
  const start = performance.now();
  const data = await apiClient.request('/platform/tag/policies/sync', { method: 'POST' });
  metrics.apiLatency('/platform/tag/policies/sync', performance.now() - start, { module: 'settings/platform-tag' });
  return data;
}
