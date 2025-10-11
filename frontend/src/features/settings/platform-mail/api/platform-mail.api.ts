import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchMailProviders() {
  const start = performance.now();
  const data = await apiClient.request('/platform/mail/providers', { method: 'GET' });
  metrics.apiLatency('/platform/mail/providers', performance.now() - start, { module: 'settings/platform-mail' });
  return data;
}

export async function testMailConnection() {
  const start = performance.now();
  const data = await apiClient.request('/platform/mail/test', { method: 'POST' });
  metrics.apiLatency('/platform/mail/test', performance.now() - start, { module: 'settings/platform-mail' });
  return data;
}
