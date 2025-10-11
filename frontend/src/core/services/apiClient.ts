import { metricsService } from './metrics';
import { loggingService } from './logging';
import { OBSERVABILITY_EVENTS } from '../constants/events';

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export interface ApiRequestOptions extends RequestInit {
  tenantId?: string;
  skipAuth?: boolean;
}

const withTenantHeaders = (init: RequestInit, tenantId?: string): RequestInit => {
  const headers = new Headers(init.headers ?? {});
  if (tenantId) {
    headers.set('X-Tenant-ID', tenantId);
  }
  headers.set('Content-Type', 'application/json');
  return { ...init, headers };
};

export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const startedAt = performance.now();
  const init = withTenantHeaders(options, options.tenantId);
  const response = await fetch(`${defaultBaseUrl}${path}`, init);
  const latency = performance.now() - startedAt;
  metricsService.observe(OBSERVABILITY_EVENTS.apiLatency, latency, { path });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    loggingService.error('API request failed', { path, status: response.status, error: errorBody });
    throw errorBody;
  }

  loggingService.debug('API request success', { path, status: response.status });
  return response.json() as Promise<T>;
}
