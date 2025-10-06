import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { showToast } from '../toast';
import { getContentString } from '@/assets/content';

export interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: AxiosResponse['headers'];
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

type ApiRequestConfig<TData = unknown> = AxiosRequestConfig<TData>;

type AxiosApiResponse<T> = AxiosResponse<T>;

const envBaseURL = import.meta.env.VITE_API_BASE_URL;
const rawBaseURL = envBaseURL?.trim();

if (!rawBaseURL) {
  const message =
    'VITE_API_BASE_URL is not defined. Please set this environment variable in your Vite configuration (e.g., .env file).';
  throw new Error(message);
}

const normalizedBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const stripLeadingSlash = (url: string) => url.replace(/^\/+/, '');

const client: AxiosInstance = axios.create({
  baseURL: normalizedBaseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const response = error.response;
    const payload = response?.data;
    return new ApiError(payload?.message ?? error.message, {
      status: response?.status,
      code: payload?.code,
      details: payload?.details
    });
  }

  const fallbackMessage = error instanceof Error ? error.message : 'Unknown error';
  return new ApiError(fallbackMessage);
};

// Add request interceptor to prefix API paths with /api/v1 if not already present
client.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('/api/v1') && !config.url.startsWith('http')) {
    config.url = `/api/v1${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const apiError = normalizeError(error);
    const message = apiError.message ?? '';

    if (apiError.status === 403 && message.toLowerCase().includes('license')) {
      const localized = getContentString('GLOBAL.MESSAGES.LICENSE_INVALID');
      showToast(localized || 'Your license is invalid or has expired. Some features may be limited.', 'error');
    }

    return Promise.reject(apiError);
  }
);

const wrap = async <T>(promise: Promise<AxiosApiResponse<T>>): Promise<ApiResponse<T>> => {
  try {
    const response = await promise;
    return { data: response.data, status: response.status, headers: response.headers };
  } catch (error) {
    throw normalizeError(error);
  }
};

const api = {
  get: <TResponse>(url: string, config?: ApiRequestConfig) =>
    wrap<TResponse>(client.get(stripLeadingSlash(url), config)),
  post: <TResponse, TRequest = unknown>(url: string, data?: TRequest, config?: ApiRequestConfig<TRequest>) =>
    wrap<TResponse>(client.post(stripLeadingSlash(url), data, config)),
  put: <TResponse, TRequest = unknown>(url: string, data?: TRequest, config?: ApiRequestConfig<TRequest>) =>
    wrap<TResponse>(client.put(stripLeadingSlash(url), data, config)),
  patch: <TResponse, TRequest = unknown>(url: string, data?: TRequest, config?: ApiRequestConfig<TRequest>) =>
    wrap<TResponse>(client.patch(stripLeadingSlash(url), data, config)),
  del: <TResponse>(url: string, config?: ApiRequestConfig) =>
    wrap<TResponse>(client.delete(stripLeadingSlash(url), config))
};

export default api;
