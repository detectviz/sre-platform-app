import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchAuthProviders() {
  const start = performance.now();
  const data = await apiClient.request('/platform/auth/providers', { method: 'GET' });
  metrics.apiLatency('/platform/auth/providers', performance.now() - start, { module: 'settings/platform-auth' });
  return data;
}

export async function updateAuthProvider() {
  const start = performance.now();
  const data = await apiClient.request('/platform/auth/providers', { method: 'POST' });
  metrics.apiLatency('/platform/auth/providers', performance.now() - start, { module: 'settings/platform-auth' });
  return data;
}
