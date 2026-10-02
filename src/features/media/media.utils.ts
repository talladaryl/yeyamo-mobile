import type * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { registerMediaFormData, traceMediaRuntime } from './media.runtime-trace';

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

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;

export type MediaFormDataFields = {
  usageType?: string;
  aggregateType?: string;
  aggregateId?: string;
  altText?: string;
};

const extensionByMime: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/flac': 'flac',
  'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/wav': 'wav',
  'audio/x-wav': 'wav', 'application/pdf': 'pdf',
};
const mimeByExtension: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', flac: 'audio/flac', m4a: 'audio/mp4',
  wav: 'audio/wav', pdf: 'application/pdf',
};
const mimeAliases: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/x-heic': 'image/heic',
  'image/x-heif': 'image/heif',
  'video/x-m4v': 'video/mp4',
  'audio/m4a': 'audio/mp4',
};

function extensionFromName(name?: string | null) {
  const extension = name?.split('.').pop()?.trim().toLocaleLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : undefined;
}

/** Keeps the picker MIME when present and only falls back from a known name/type. */
export function resolveMediaMimeType(asset: PickedMediaAsset): string {
  const declaredMime = asset.mimeType?.toLocaleLowerCase();
  const normalizedMime = declaredMime ? mimeAliases[declaredMime] ?? declaredMime : undefined;
  if (normalizedMime && extensionByMime[normalizedMime]) return normalizedMime;
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
  if (existingName && existingExtension && mimeByExtension[existingExtension] === mimeType) {
    const safeName = existingName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
    if (safeName) return safeName.slice(-180);
  }
  return `${prefix}-${index + 1}.${expectedExtension}`;
}

export function validateMediaAsset(asset: PickedMediaAsset): void {
  const mimeType = resolveMediaMimeType(asset);
  if (!extensionByMime[mimeType]) throw new Error(`Format de média non pris en charge (${mimeType}).`);
  const maximum = mimeType.startsWith('video/') ? MAX_VIDEO_UPLOAD_BYTES : MAX_IMAGE_UPLOAD_BYTES;
  if (typeof asset.fileSize === 'number' && asset.fileSize > maximum) {
    throw new Error(`Ce fichier dépasse la limite de ${maximum / 1024 / 1024} Mo. Choisissez un média plus léger.`);
  }
}

function isHeicOrHeif(asset: PickedMediaAsset): boolean {
  const mimeType = resolveMediaMimeType(asset);
  return mimeType === 'image/heic' || mimeType === 'image/heif';
}

/**
 * iOS may return HEIC/HEIF assets while the media service accepts JPEG/PNG/WebP.
 * The conversion is local, before multipart construction; no HEIC byte is sent to
 * the backend and the resulting file metadata matches its JPEG bytes.
 */
export async function normalizeImageForUpload(
  asset: PickedMediaAsset,
  prefix = 'yeyamo-media',
  index = 0,
): Promise<PickedMediaAsset> {
  if (!isHeicOrHeif(asset)) return asset;

  const sourceMimeType = resolveMediaMimeType(asset);
  traceMediaRuntime('MEDIA_SOURCE_DETECTED', {
    flow: prefix,
    sourceMimeType,
    sourceExtension: extensionFromName(asset.fileName) ?? 'unknown',
    conversionRequired: true,
  });
  try {
    traceMediaRuntime('MEDIA_CONVERSION_START', {
      flow: prefix,
      sourceMimeType,
      targetMimeType: 'image/jpeg',
      conversionPerformed: true,
    });
    const converted = await manipulateAsync(asset.uri, [], {
      compress: 0.92,
      format: SaveFormat.JPEG,
    });
    const normalized: PickedMediaAsset = {
      ...asset,
      uri: converted.uri,
      type: 'image',
      mimeType: 'image/jpeg',
      fileName: `${prefix}-${index + 1}.jpg`,
      width: converted.width,
      height: converted.height,
    };
    traceMediaRuntime('MEDIA_CONVERSION_SUCCESS', {
      flow: prefix,
      sourceMimeType,
      targetMimeType: 'image/jpeg',
      conversionPerformed: true,
    });
    return normalized;
  } catch (error) {
    traceMediaRuntime('MEDIA_CONVERSION_ERROR', {
      flow: prefix,
      sourceMimeType,
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    throw new Error('Cette image HEIC ne peut pas Ãªtre convertie en JPEG. Choisissez une autre image puis rÃ©essayez.');
  }
}

export async function toMediaFormData(asset: PickedMediaAsset, prefix?: string, index?: number, fields: MediaFormDataFields = {}): Promise<FormData> {
  const flow = prefix ?? 'media';
  validateMediaAsset(asset);
  const normalizedAsset = await normalizeImageForUpload(asset, flow, index ?? 0);
  const mimeType = resolveMediaMimeType(normalizedAsset);
  const fileName = resolveMediaFileName(normalizedAsset, prefix, index);
  traceMediaRuntime('NORMALIZE', {
    flow,
    mediaType: normalizedAsset.type ?? 'unknown',
    mimeType,
    hasFileSize: typeof normalizedAsset.fileSize === 'number',
    conversionPerformed: normalizedAsset !== asset,
  });
  const formData = new FormData();
  formData.append('file', { uri: normalizedAsset.uri, name: fileName, type: mimeType } as unknown as Blob);
  if (fields.usageType) formData.append('usageType', fields.usageType);
  if (fields.aggregateType) formData.append('aggregateType', fields.aggregateType);
  if (fields.aggregateId) formData.append('aggregateId', fields.aggregateId);
  if (fields.altText) formData.append('altText', fields.altText);
  registerMediaFormData(formData, flow, mimeType, {
    mediaType: normalizedAsset.type ?? (mimeType.startsWith('video/') ? 'video' : 'image'),
    fileSize: normalizedAsset.fileSize,
  });
  return formData;
}

export function isVideoAsset(asset: PickedMediaAsset): boolean {
  return asset.type === 'video' || resolveMediaMimeType(asset).startsWith('video/');
}
