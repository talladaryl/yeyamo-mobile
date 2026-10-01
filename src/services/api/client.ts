import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import ENV from '@/config/env';
import { secureStore } from '@/services/storage/secure-store';
import { normalizeApiError } from './errors';
import { isMultipartFormData, removeJsonContentTypeForMultipart } from './multipart';
import { mediaTraceForFormData, traceMediaRuntime } from '@/features/media/media.runtime-trace';

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

export type YeyamoApiRequestConfig = AxiosRequestConfig & {
  /** Development trace metadata; Axios does not serialize unknown config keys. */
  yeyamoTrace?: { flow: string; stage: string };
};

function headerValue(headers: unknown, name: string): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const candidate = headers as { get?: (key: string) => unknown; [key: string]: unknown };
  const fromGetter = candidate.get?.(name);
  if (typeof fromGetter === 'string') return fromGetter;
  const direct = candidate[name] ?? candidate[name.toLowerCase()];
  return typeof direct === 'string' ? direct : null;
}

function traceMediaHttp(config: InternalAxiosRequestConfig, stage: 'HTTP_MEDIA_REQUEST' | 'HTTP_MEDIA_RESPONSE' | 'HTTP_MEDIA_ERROR', status?: number, responseBody?: unknown, transport?: { timeout?: boolean; errorType?: string } ) {
  const context = mediaTraceForFormData(config.data);
  if (!context || !isMultipartFormData(config.data)) return;
  const body = responseBody && typeof responseBody === 'object' ? responseBody as { code?: unknown; message?: unknown } : undefined;
  traceMediaRuntime(stage, {
    traceId: context.id,
    flow: context.flow,
    method: config.method?.toUpperCase() ?? 'POST',
    url: `${apiBaseUrl}${config.url ?? ''}`,
    bodyType: 'FormData',
    mimeType: context.mimeType,
    mediaType: context.mediaType,
    fileSizeBucket: context.fileSizeBucket,
    // null is intentional: RN must attach the multipart boundary itself.
    explicitContentType: headerValue(config.headers, 'Content-Type'),
    correlationId: headerValue(config.headers, 'X-Correlation-ID'),
    status: status ?? null,
    serverCode: typeof body?.code === 'string' ? body.code : null,
    serverMessage: typeof body?.message === 'string' ? body.message : null,
    transportError: transport?.errorType ?? null,
    timeout: transport?.timeout ?? false,
  });
}

function traceMediaTransportReady(data: unknown, headers: unknown): void {
  const context = mediaTraceForFormData(data);
  if (!context || !isMultipartFormData(data)) return;
  traceMediaRuntime('HTTP_MEDIA_TRANSPORT_READY', {
    traceId: context.id,
    flow: context.flow,
    bodyType: 'FormData',
    isFormData: true,
    // Must remain null here. The React Native transport adds the multipart
    // boundary rather than receiving a hand-written Content-Type.
    explicitContentType: headerValue(headers, 'Content-Type'),
  });
}

function traceBusinessHttp(config: InternalAxiosRequestConfig, phase: 'HTTP_BUSINESS_REQUEST' | 'HTTP_BUSINESS_RESPONSE' | 'HTTP_BUSINESS_ERROR', status?: number, responseBody?: unknown) {
  const trace = (config as InternalAxiosRequestConfig & { yeyamoTrace?: { flow: string; stage: string } }).yeyamoTrace;
  if (!trace) return;
  const body = responseBody && typeof responseBody === 'object' ? responseBody as { code?: unknown; message?: unknown } : undefined;
  traceMediaRuntime(phase, {
    flow: trace.flow,
    stage: trace.stage,
    method: config.method?.toUpperCase() ?? 'POST',
    url: `${apiBaseUrl}${config.url ?? ''}`,
    bodyType: isMultipartFormData(config.data) ? 'FormData' : typeof config.data,
    status: status ?? null,
    serverCode: typeof body?.code === 'string' ? body.code : null,
    serverMessage: typeof body?.message === 'string' ? body.message : null,
    correlationId: headerValue(config.headers, 'X-Correlation-ID'),
  });
}

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
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Axios 1.18 recognises the native FormData implementation in normal Expo
  // runtimes. React Native may nevertheless expose a FormData-shaped object
  // that Axios itself does not recognise. Preserve that object before the
  // default JSON transformer can stringify it, while retaining the exact
  // default transform chain for every non-multipart request.
  transformRequest: [function transformRequest(data, headers) {
    if (isMultipartFormData(data)) {
      removeJsonContentTypeForMultipart({ data, headers });
      traceMediaTransportReady(data, headers);
      return data;
    }
    const defaults = axios.defaults.transformRequest;
    const transforms = Array.isArray(defaults) ? defaults : [defaults];
    let transformed = data;
    for (const transform of transforms) {
      if (transform) transformed = transform.call(this as unknown as InternalAxiosRequestConfig, transformed, headers);
    }
    return transformed;
  }],
});

// ─── Request interceptor — inject Bearer token ───────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Axios serializes plain objects as JSON. FormData must instead remain
    // untouched and have no explicit Content-Type so React Native supplies
    // the multipart boundary at transport time.
    removeJsonContentTypeForMultipart(config);

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
    traceMediaHttp(config, 'HTTP_MEDIA_REQUEST');
    traceBusinessHttp(config, 'HTTP_BUSINESS_REQUEST');
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response interceptor — handle 401 ───────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    traceMediaHttp(response.config, 'HTTP_MEDIA_RESPONSE', response.status, response.data);
    traceBusinessHttp(response.config, 'HTTP_BUSINESS_RESPONSE', response.status, response.data);
    return response;
  },
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (request) traceMediaHttp(request, 'HTTP_MEDIA_ERROR', error.response?.status, error.response?.data, {
      timeout: error.code === 'ECONNABORTED' || /timeout/i.test(error.message ?? ''),
      errorType: error.code ?? error.name,
    });
    if (request) traceBusinessHttp(request, 'HTTP_BUSINESS_ERROR', error.response?.status, error.response?.data);
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
export async function apiGet<T>(url: string, config?: YeyamoApiRequestConfig): Promise<T> {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: YeyamoApiRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: YeyamoApiRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body, config);
  return data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: YeyamoApiRequestConfig,
): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(url: string, config?: YeyamoApiRequestConfig): Promise<T> {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
}
