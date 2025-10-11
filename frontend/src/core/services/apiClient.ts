import { metrics } from './metrics';
import { logging } from './logging';

export interface ApiClientOptions {
  tenantId: string;
  baseUrl?: string;
  getToken?: () => Promise<string | undefined>;
}

export class ApiClient {
  private baseUrl: string;
  private tenantId: string;
  private getToken?: () => Promise<string | undefined>;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl ?? '/api/v1';
    this.tenantId = options.tenantId;
    this.getToken = options.getToken;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const start = performance.now();
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('X-Tenant-ID', this.tenantId);

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(url, { ...init, headers });
    const latency = performance.now() - start;
    metrics.apiLatency(path, latency, { tenantId: this.tenantId });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      logging.error('api_error', {
        module: 'core.services.apiClient',
        scope: path,
        tenantId: this.tenantId,
        context: errorBody,
      });
      throw errorBody;
    }

    return (await response.json()) as T;
  }
}

export const apiClient = new ApiClient({ tenantId: 'default' });
