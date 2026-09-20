import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import ENV from '@/config/env';
import { secureStore } from '@/services/storage/secure-store';
import { normalizeApiError } from './errors';

// ─── Singleton router ref (set from root layout) ────────────────────────────
// Avoids importing expo-router directly in a service (no React context here)
let _onUnauthenticated: (() => void) | null = null;
let _onTokenRefreshed: ((accessToken: string) => void) | null = null;
let unauthenticatedSessionHandled = false;
export function registerUnauthenticatedHandler(handler: () => void) {
  _onUnauthenticated = handler;
}
export function registerTokenRefreshedHandler(handler: (accessToken: string) => void) {
  _onTokenRefreshed = handler;
}
/** Allows a newly established session to report a future, genuine expiry. */
export function resetUnauthenticatedSessionHandler() {
  unauthenticatedSessionHandled = false;
}

const apiBaseUrl = `${ENV.API_BASE_URL.replace(/\/$/, '')}/api/v1`;
let refreshPromise: Promise<string> | null = null;

function isPublicRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? '';
  return url.startsWith('/countries')
    || /^\/auth\/(?:login|register|refresh|oauth|google|apple|verify|resend|forgot|reset)/.test(url);
}

// ─── Axios instance ──────────────────────────────────────────────────────────
const createClient = axios['create'];
export const apiClient = createClient({
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
    // An expired bearer token makes otherwise public Spring Security endpoints
    // answer 401 before their permitAll rule is evaluated. Registration and
    // country selection must therefore remain true guest requests.
    if (token && config.headers && !isPublicRequest(config)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers && !config.headers['X-Correlation-ID'] && !config.headers['X-Correlation-Id']) {
      config.headers['X-Correlation-ID'] = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
      const [sessionMode, accessToken, refreshToken] = await Promise.all([
        secureStore.get(secureStore.KEYS.SESSION_MODE),
        secureStore.get(secureStore.KEYS.AUTH_TOKEN),
        secureStore.get(secureStore.KEYS.REFRESH_TOKEN),
      ]);

      // A guest request must never be interpreted as an expired session.
      if (sessionMode !== 'backend' || !accessToken || !refreshToken) {
        return Promise.reject(error);
      }

      request._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        request.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient.request(request);
      } catch {
        await secureStore.clearAuthSession();
        // Several requests can fail at once. Show one expiration message and
        // perform one redirect, rather than trapping the auth screens in a loop.
        if (!unauthenticatedSessionHandled) {
          unauthenticatedSessionHandled = true;
          _onUnauthenticated?.();
        }
      }
    }
    return Promise.reject(error);
  },
);

// Runs after authentication refresh handling; it never performs logout or redirects.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
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
