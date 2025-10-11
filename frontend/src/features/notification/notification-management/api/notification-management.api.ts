import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchNotificationStrategies() {
  const start = performance.now();
  const data = await apiClient.request('/notifications/strategies', { method: 'GET' });
  metrics.apiLatency('/notifications/strategies', performance.now() - start, { module: 'notification/notification-management' });
  return data;
}

export async function fetchNotificationChannels() {
  const start = performance.now();
  const data = await apiClient.request('/notifications/channels', { method: 'GET' });
  metrics.apiLatency('/notifications/channels', performance.now() - start, { module: 'notification/notification-management' });
  return data;
}

export async function fetchNotificationHistory() {
  const start = performance.now();
  const data = await apiClient.request('/notifications/history', { method: 'GET' });
  metrics.apiLatency('/notifications/history', performance.now() - start, { module: 'notification/notification-management' });
  return data;
}
