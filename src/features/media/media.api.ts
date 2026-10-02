import { apiClient, apiGet } from '@/services/api/client';
import { absoluteApiUrl, mediaContentUrl } from '@/services/api/contracts';
import type { EntityId, MediaAttachment } from '@/types/api.types';
import { mediaTraceForFormData, traceMediaRuntime } from './media.runtime-trace';
import { toMediaFormData, type PickedMediaAsset } from './media.utils';

export interface MediaUploadAsset {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  type?: string | null;
}

export interface MediaUploadResponse {
  id: string;
  mediaId?: string;
  type?: string;
  contentType?: string;
  contentUrl?: string;
  [key: string]: unknown;
}

interface BackendMediaMetadata {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  contentUrl?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
}

function mapMediaAttachment(media: BackendMediaMetadata): MediaAttachment {
  return {
    id: media.id,
    url: absoluteApiUrl(media.contentUrl) ?? mediaContentUrl(media.id),
    thumbnail_url: absoluteApiUrl(media.thumbnailUrl) ?? null,
    type: media.type === 'VIDEO' ? 'video' : 'image',
    width: media.width ?? 0,
    height: media.height ?? 0,
    duration_seconds: media.durationMs == null ? null : Math.max(0, Math.round(media.durationMs / 1000)),
  };
}

/** Resolves real media metadata for consumers whose parent DTO only exposes mediaIds. */
export async function getMediaAttachment(mediaId: EntityId): Promise<MediaAttachment> {
  const media = await apiGet<BackendMediaMetadata>(`/media/${mediaId}`);
  return mapMediaAttachment(media);
}

/** Feed uses one request instead of fetching each card's media metadata. */
export async function getMediaAttachments(mediaIds: EntityId[]): Promise<Map<string, MediaAttachment>> {
  const ids = [...new Set(mediaIds.map(String).filter(Boolean))].slice(0, 50);
  if (!ids.length) return new Map();
  const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&');
  const media = await apiGet<BackendMediaMetadata[]>(`/media/batch?${query}`);
  return new Map(media.map((item) => [String(item.id), mapMediaAttachment(item)]));
}

/** Uploads a real local asset. No optimistic success is returned. */
export async function uploadMedia(
  asset: MediaUploadAsset,
  options: { usageType?: string; aggregateType?: string; aggregateId?: string; altText?: string } = {},
): Promise<MediaUploadResponse> {
  const flow = options.usageType?.startsWith('ARTWORK_') ? 'artwork' : options.usageType ? 'culture' : 'generic-media';
  const pickedAsset = {
    uri: asset.uri,
    type: asset.type === 'video' ? 'video' : 'image',
    mimeType: asset.mimeType,
    fileName: asset.name,
    width: 0,
    height: 0,
  } satisfies PickedMediaAsset;
  const form = await toMediaFormData(pickedAsset, flow, 0, options);
  // The extended endpoint requires a usageType. General uploads (profile,
  // public creation flows) use the canonical endpoint instead. Do not set
  // Content-Type manually: React Native supplies the multipart boundary.
  const endpoint = options.usageType ? '/media/culture' : '/media';
  return uploadMediaFormData(form, endpoint);
}

/**
 * One canonical FormData transport for every public creation flow. The form
 * carries its original flow context from `toMediaFormData`, so Story, Place
 * and Outing traces cannot be mislabeled as a post upload.
 */
export async function uploadMediaFormData(form: FormData, endpoint = '/media'): Promise<MediaUploadResponse> {
  const context = mediaTraceForFormData(form);
  const flow = context?.flow ?? 'generic-media';
  traceMediaRuntime('MEDIA_UPLOAD_REQUEST', {
    flow,
    method: 'POST',
    url: endpoint,
    mimeType: context?.mimeType ?? 'unknown',
    mediaType: context?.mediaType ?? 'unknown',
    fileSizeBucket: context?.fileSizeBucket ?? 'unknown',
  });
  try {
    // Do not provide Content-Type: React Native assigns the multipart
    // boundary. The client transform preserves FormData before Axios defaults.
    const { data } = await apiClient.post<MediaUploadResponse>(endpoint, form, { timeout: 120_000 });
    traceMediaRuntime('MEDIA_UPLOAD_RESPONSE', { flow, method: 'POST', url: endpoint, status: 201, mediaId: String(data.id) });
    return data;
  } catch (error) {
    const normalized = error as { status?: number; code?: string; message?: string };
    traceMediaRuntime('MEDIA_UPLOAD_ERROR', {
      flow,
      method: 'POST',
      url: endpoint,
      mimeType: context?.mimeType ?? 'unknown',
      mediaType: context?.mediaType ?? 'unknown',
      fileSizeBucket: context?.fileSizeBucket ?? 'unknown',
      status: normalized.status ?? null,
      serverCode: normalized.code ?? null,
      serverMessage: normalized.status ? normalized.message ?? null : null,
      transportError: normalized.status ? null : normalized.code ?? (error instanceof Error ? error.name : 'UnknownError'),
      timeout: normalized.code === 'ECONNABORTED' || /timeout/i.test(normalized.message ?? ''),
    });
    throw error;
  }
}
