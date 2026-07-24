import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import ENV from '@/config/env';
import { secureStore } from '@/services/storage/secure-store';

// ─── Singleton router ref (set from root layout) ────────────────────────────
// Avoids importing expo-router directly in a service (no React context here)
let _onUnauthenticated: (() => void) | null = null;
let _onTokenRefreshed: ((accessToken: string) => void) | null = null;
export function registerUnauthenticatedHandler(handler: () => void) {
  _onUnauthenticated = handler;
}
export function registerTokenRefreshedHandler(handler: (accessToken: string) => void) {
  _onTokenRefreshed = handler;
}

const apiBaseUrl = `${ENV.API_BASE_URL.replace(/\/$/, '')}/api/v1`;
let refreshPromise: Promise<string> | null = null;

// ─── Axios instance ──────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// ─── Request interceptor — inject Bearer token ───────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStore.get(secureStore.KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response interceptor — handle 401 ───────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthenticationRequest = request?.url?.startsWith('/auth/login')
      || request?.url?.startsWith('/auth/register')
      || request?.url?.startsWith('/auth/refresh');

    if (error.response?.status === 401 && request && !request._retry && !isAuthenticationRequest) {
      request._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        request.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient.request(request);
      } catch {
        await secureStore.clearAll();
        _onUnauthenticated?.();
      }
    }
    return Promise.reject(error);
  },
);

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await secureStore.get(secureStore.KEYS.REFRESH_TOKEN);
  if (!refreshToken) throw new Error('Refresh token absent');

  const { data } = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${apiBaseUrl}/auth/refresh`, { refreshToken }, {
    timeout: 15_000,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });

  await Promise.all([
    secureStore.set(secureStore.KEYS.AUTH_TOKEN, data.accessToken),
    secureStore.set(secureStore.KEYS.REFRESH_TOKEN, data.refreshToken),
  ]);
  _onTokenRefreshed?.(data.accessToken);
  return data.accessToken;
}

// ─── Typed helper wrappers ────────────────────────────────────────────────────
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body, config);
  return data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
}
