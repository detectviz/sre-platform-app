import { apiClient } from '@core/services/apiClient';
import { metrics } from '@core/services/metrics';

export async function fetchBacktesting() {
  const start = performance.now();
  const data = await apiClient.request('/insight/backtesting', { method: 'GET' });
  metrics.apiLatency('/insight/backtesting', performance.now() - start, { module: 'insight/insight-analysis' });
  return data;
}

export async function fetchCapacityPlans() {
  const start = performance.now();
  const data = await apiClient.request('/insight/capacity', { method: 'GET' });
  metrics.apiLatency('/insight/capacity', performance.now() - start, { module: 'insight/insight-analysis' });
  return data;
}
