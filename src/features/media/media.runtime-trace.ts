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
  mediaType: string;
  fileSizeBucket: 'unknown' | 'small' | 'medium' | 'large' | 'oversize';
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

function fileSizeBucket(fileSize?: number | null): MediaTraceContext['fileSizeBucket'] {
  if (typeof fileSize !== 'number' || !Number.isFinite(fileSize) || fileSize < 0) return 'unknown';
  if (fileSize <= 1_000_000) return 'small';
  if (fileSize <= 5_000_000) return 'medium';
  if (fileSize <= 20_000_000) return 'large';
  return 'oversize';
}

export function registerMediaFormData(
  formData: FormData,
  flow: string,
  mimeType: string,
  options: { mediaType?: string; fileSize?: number | null } = {},
): MediaTraceContext {
  const context: MediaTraceContext = {
    id: newTraceId(),
    flow,
    mimeType,
    mediaType: options.mediaType ?? (mimeType.startsWith('video/') ? 'video' : 'image'),
    fileSizeBucket: fileSizeBucket(options.fileSize),
  };
  formContexts.set(formData, context);
  traceMediaRuntime('FORM_DATA', {
    traceId: context.id,
    flow: context.flow,
    bodyType: 'FormData',
    mimeType: context.mimeType,
    mediaType: context.mediaType,
    fileSizeBucket: context.fileSizeBucket,
    partNames: ['file'],
  });
  return context;
}

export function mediaTraceForFormData(value: unknown): MediaTraceContext | undefined {
  return value && typeof value === 'object' ? formContexts.get(value) : undefined;
}
