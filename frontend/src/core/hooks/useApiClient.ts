import { useAuthContext } from '../contexts/AuthContext';
import { apiClient, ApiRequestOptions } from '../services/apiClient';

export function useApiClient() {
  const { tenantId } = useAuthContext();
  return async function callApi<T>(path: string, options: ApiRequestOptions = {}) {
    return apiClient<T>(path, { ...options, tenantId: options.tenantId ?? tenantId });
  };
}
