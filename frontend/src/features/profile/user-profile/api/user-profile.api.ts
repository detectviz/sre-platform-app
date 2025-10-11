import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchUserProfile() {
  const start = performance.now();
  const data = await apiClient.request('/profile', { method: 'GET' });
  metrics.apiLatency('/profile', performance.now() - start, { module: 'profile/user-profile' });
  return data;
}

export async function updateUserPreferences() {
  const start = performance.now();
  const data = await apiClient.request('/profile/preferences', { method: 'POST' });
  metrics.apiLatency('/profile/preferences', performance.now() - start, { module: 'profile/user-profile' });
  return data;
}
