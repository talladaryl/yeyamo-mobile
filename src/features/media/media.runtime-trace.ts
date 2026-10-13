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
  declaredMime: string;
  extension: string;
  mediaType: string;
  fileSizeBucket: 'unknown' | 'small' | 'medium' | 'large' | 'oversize';
}>;

const formContexts = new WeakMap<object, MediaTraceContext>();
const mediaContexts = new Map<string, MediaTraceContext>();

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
  options: { mediaType?: string; fileSize?: number | null; declaredMime?: string | null; extension?: string } = {},
): MediaTraceContext {
  const context: MediaTraceContext = {
    id: newTraceId(),
    flow,
    mimeType,
    declaredMime: options.declaredMime ?? 'unknown',
    extension: options.extension ?? 'unknown',
    mediaType: options.mediaType ?? (mimeType.startsWith('video/') ? 'video' : 'image'),
    fileSizeBucket: fileSizeBucket(options.fileSize),
  };
  formContexts.set(formData, context);
  traceMediaRuntime('MEDIA_FORMDATA_READY', {
    traceId: context.id,
    flow: context.flow,
    bodyType: 'FormData',
    mimeType: context.mimeType,
    declaredMime: context.declaredMime,
    extension: context.extension,
    mediaType: context.mediaType,
    fileSizeBucket: context.fileSizeBucket,
    partNames: ['file'],
  });
  return context;
}

export function mediaTraceForFormData(value: unknown): MediaTraceContext | undefined {
  return value && typeof value === 'object' ? formContexts.get(value) : undefined;
}

export function registerCreatedMedia(mediaId: string, context?: MediaTraceContext): void {
  if (!context || !mediaId) return;
  mediaContexts.set(mediaId, context);
}

export function mediaTraceForAssociation(value: unknown): MediaTraceContext | undefined {
  const visited = new Set<unknown>();
  const find = (candidate: unknown): MediaTraceContext | undefined => {
    if (typeof candidate === 'string') return mediaContexts.get(candidate);
    if (!candidate || typeof candidate !== 'object' || visited.has(candidate)) return undefined;
    visited.add(candidate);
    if (Array.isArray(candidate)) {
      for (const item of candidate) { const context = find(item); if (context) return context; }
      return undefined;
    }
    for (const [key, item] of Object.entries(candidate as Record<string, unknown>)) {
      if (/media/i.test(key)) { const context = find(item); if (context) return context; }
    }
    return undefined;
  };
  return find(value);
}
