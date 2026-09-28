/**
 * Development-only observability for media uploads.
 *
 * It deliberately never records bearer tokens, cookies, device URIs, binary
 * data, captions or response payloads.  The trace id is kept in memory only
 * and lets device logs be correlated with the gateway/media-service logs via
 * X-Correlation-ID.
 */
export type MediaTraceContext = Readonly<{
  id: string;
  flow: string;
  mimeType: string;
}>;

const formContexts = new WeakMap<object, MediaTraceContext>();

function devEnabled(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function newTraceId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function traceMediaRuntime(stage: string, details: Record<string, unknown>): void {
  if (!devEnabled()) return;
  console.info('[YEYAMO_MEDIA_TRACE]', JSON.stringify({ stage, at: new Date().toISOString(), ...details }));
}

export function registerMediaFormData(formData: FormData, flow: string, mimeType: string): MediaTraceContext {
  const context: MediaTraceContext = { id: newTraceId(), flow, mimeType };
  formContexts.set(formData, context);
  traceMediaRuntime('FORM_DATA', {
    traceId: context.id,
    flow: context.flow,
    bodyType: 'FormData',
    mimeType: context.mimeType,
    partNames: ['file'],
  });
  return context;
}

export function mediaTraceForFormData(value: unknown): MediaTraceContext | undefined {
  return value && typeof value === 'object' ? formContexts.get(value) : undefined;
}

