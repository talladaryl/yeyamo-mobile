import { apiClient } from '@/services/api/client';

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
  const { data } = await apiClient.post<MediaUploadResponse>('/media/culture', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000,
  });
  return data;
}
