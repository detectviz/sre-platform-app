import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchPersonnel() {
  const start = performance.now();
  const data = await apiClient.request('/iam/personnel', { method: 'GET' });
  metrics.apiLatency('/iam/personnel', performance.now() - start, { module: 'iam/identity-access-management' });
  return data;
}

export async function fetchTeams() {
  const start = performance.now();
  const data = await apiClient.request('/iam/teams', { method: 'GET' });
  metrics.apiLatency('/iam/teams', performance.now() - start, { module: 'iam/identity-access-management' });
  return data;
}

export async function fetchRoles() {
  const start = performance.now();
  const data = await apiClient.request('/iam/roles', { method: 'GET' });
  metrics.apiLatency('/iam/roles', performance.now() - start, { module: 'iam/identity-access-management' });
  return data;
}
