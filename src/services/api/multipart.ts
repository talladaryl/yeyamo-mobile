/**
 * React Native's FormData implementation exposes `getParts`, whereas browser
 * implementations are normally identified with `instanceof FormData`. Support
 * both forms so the shared Axios client never serializes an upload as JSON.
 */
export function isMultipartFormData(value: unknown): value is FormData {
  if (typeof FormData !== 'undefined' && value instanceof FormData) return true;

  if (!value || typeof value !== 'object') return false;
  const candidate = value as { append?: unknown; getParts?: unknown; _parts?: unknown };
  return typeof candidate.append === 'function'
    && (typeof candidate.getParts === 'function' || Array.isArray(candidate._parts));
}

type MutableHeaders = {
  delete?: (name: string | string[]) => boolean;
  [name: string]: unknown;
};

/**
 * Axios merges instance defaults into each request. A JSON default must be
 * removed for FormData so the React Native adapter can generate the multipart
 * boundary. This deliberately does not set multipart/form-data itself.
 */
export function removeJsonContentTypeForMultipart(config: {
  data?: unknown;
  headers?: MutableHeaders;
}): boolean {
  if (!isMultipartFormData(config.data) || !config.headers) return false;

  config.headers.delete?.('Content-Type');
  delete config.headers['Content-Type'];
  delete config.headers['content-type'];
  return true;
}
