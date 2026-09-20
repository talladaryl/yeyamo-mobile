import type * as ImagePicker from 'expo-image-picker';

/** Picker metadata kept through upload retries and local create drafts. */
export type PickedMediaAsset = {
  uri: string;
  type?: ImagePicker.ImagePickerAsset['type'];
  mimeType?: string | null;
  fileName?: string | null;
  width: number;
  height: number;
  duration?: number | null;
  fileSize?: number | null;
};

const extensionByMime: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};
const mimeByExtension: Record<string, string> = Object.fromEntries(Object.entries(extensionByMime).map(([mime, extension]) => [extension, mime]));

function extensionFromName(name?: string | null) {
  const extension = name?.split('.').pop()?.trim().toLocaleLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : undefined;
}

/** Keeps the picker MIME when present and only falls back from a known name/type. */
export function resolveMediaMimeType(asset: PickedMediaAsset): string {
  if (asset.mimeType && extensionByMime[asset.mimeType.toLocaleLowerCase()]) return asset.mimeType.toLocaleLowerCase();
  const namedExtension = extensionFromName(asset.fileName);
  if (namedExtension && mimeByExtension[namedExtension]) return mimeByExtension[namedExtension];
  return asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
}

/** Produces a filename whose extension agrees with the MIME declared in multipart. */
export function resolveMediaFileName(asset: PickedMediaAsset, prefix = 'yeyamo-media', index = 0): string {
  const mimeType = resolveMediaMimeType(asset);
  const expectedExtension = extensionByMime[mimeType] ?? (asset.type === 'video' ? 'mp4' : 'jpg');
  const existingName = asset.fileName?.trim();
  const existingExtension = extensionFromName(existingName);
  if (existingName && existingExtension && mimeByExtension[existingExtension] === mimeType) return existingName;
  return `${prefix}-${index + 1}.${expectedExtension}`;
}

export function toMediaFormData(asset: PickedMediaAsset, prefix?: string, index?: number): FormData {
  const formData = new FormData();
  formData.append('file', { uri: asset.uri, name: resolveMediaFileName(asset, prefix, index), type: resolveMediaMimeType(asset) } as unknown as Blob);
  return formData;
}

export function isVideoAsset(asset: PickedMediaAsset): boolean {
  return asset.type === 'video' || resolveMediaMimeType(asset).startsWith('video/');
}
