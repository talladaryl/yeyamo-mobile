import { apiClient, apiGet } from '@/services/api/client';
import { absoluteApiUrl, mediaContentUrl } from '@/services/api/contracts';
import type { EntityId, MediaAttachment } from '@/types/api.types';

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

/** Resolves real media metadata for consumers whose parent DTO only exposes mediaIds. */
export async function getMediaAttachment(mediaId: EntityId): Promise<MediaAttachment> {
  const media = await apiGet<BackendMediaMetadata>(`/media/${mediaId}`);
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

/** Uploads a real local asset. No optimistic success is returned. */
export async function uploadMedia(
  asset: MediaUploadAsset,
  options: { usageType?: string; aggregateType?: string; aggregateId?: string; altText?: string } = {},
): Promise<MediaUploadResponse> {
  const form = new FormData();
  form.append('file', {
    uri: asset.uri,
    name: asset.name ?? `yeyamo-${Date.now()}`,
    type: asset.mimeType ?? (asset.type === 'image' ? 'image/jpeg' : asset.type === 'video' ? 'video/mp4' : 'application/octet-stream'),
  } as unknown as Blob);
  if (options.usageType) form.append('usageType', options.usageType);
  if (options.aggregateType) form.append('aggregateType', options.aggregateType);
  if (options.aggregateId) form.append('aggregateId', options.aggregateId);
  if (options.altText) form.append('altText', options.altText);
  // The extended endpoint requires a usageType. General uploads (profile,
  // public creation flows) use the canonical endpoint instead. Do not set
  // Content-Type manually: React Native supplies the multipart boundary.
  const endpoint = options.usageType ? '/media/culture' : '/media';
  const { data } = await apiClient.post<MediaUploadResponse>(endpoint, form, { timeout: 120_000 });
  return data;
}
