import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { uploadMedia, type MediaUploadAsset } from './media.api';

export function useUploadMedia() {
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({ mutationFn: ({ asset, options }: { asset: MediaUploadAsset; options?: Parameters<typeof uploadMedia>[1] }) => demo ? Promise.resolve({ id: `demo-media-${Date.now()}`, contentType: asset.mimeType ?? 'image/jpeg' }) : uploadMedia(asset, options) });
}
