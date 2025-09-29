import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { showToast } from './toast';

const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';
const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_BASE_URL;

const client: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error?.response?.status;
    const message: string | undefined = error?.response?.data?.message || error?.message;

    if (status === 403 && typeof message === 'string' && message.toLowerCase().includes('license')) {
      showToast('您的 License 無效或已過期，部分功能可能受限。', 'error');
    }

    return Promise.reject(error?.response ?? error);
  }
);

const wrap = <T>(promise: Promise<AxiosResponse<T>>): Promise<{ data: T }> =>
  promise.then((response) => ({ data: response.data }));

const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => wrap<T>(client.get(url, config)),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => wrap<T>(client.post(url, data, config)),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => wrap<T>(client.put(url, data, config)),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => wrap<T>(client.patch(url, data, config)),
  del: <T>(url: string, config?: AxiosRequestConfig) => wrap<T>(client.delete(url, config))
};

export default api;
