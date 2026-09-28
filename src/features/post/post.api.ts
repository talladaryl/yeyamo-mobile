import { apiPost, apiDelete } from '@/services/api/client';
import { absoluteApiUrl } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type { CreatePostPayload, UploadedMedia } from './types';
import { traceMediaRuntime } from '@/features/media/media.runtime-trace';

interface BackendMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  contentUrl: string;
}

interface BackendPost {
  id: string;
}

export class PostPublicationError extends Error {
  constructor(public readonly phase: 'create' | 'publish', public readonly cause: unknown) {
    super(phase === 'publish' ? 'Le brouillon a été créé, mais sa publication a échoué.' : 'La création de la publication a échoué.');
  }
}

export const postApi = {
  uploadMedia: async (formData: FormData): Promise<{ data: UploadedMedia }> => {
    // React Native must generate the multipart boundary itself. Supplying a
    // bare multipart Content-Type makes valid Expo assets unreadable by the
    // server on some Android/iOS transports.
    const media = await apiPost<BackendMedia>('/media', formData);
    return {
      data: {
        id: media.id,
        url: absoluteApiUrl(media.contentUrl) ?? media.contentUrl,
        type: media.type.toLowerCase() as UploadedMedia['type'],
      },
    };
  },

  createPost: async (payload: CreatePostPayload): Promise<{ data: { id: EntityId } }> => {
    let draft: BackendPost;
    try {
      traceMediaRuntime('POST_CREATE_DISPATCHED', { flow: 'post', url: '/posts', mediaCount: payload.media_ids.length });
      draft = await apiPost<BackendPost>('/posts', {
        caption: payload.caption,
        visibility: 'PUBLIC',
        catalogAssetId: payload.place_id ?? null,
        mediaIds: payload.media_ids,
        hashtags: [],
        ...(payload.target_type && payload.target_id ? { targetType: payload.target_type, targetId: payload.target_id } : {}),
      }, { yeyamoTrace: { flow: 'post', stage: 'POST_CREATE' } });
    } catch (error) {
      traceMediaRuntime('POST_CREATE_ERROR', { flow: 'post', url: '/posts' });
      throw new PostPublicationError('create', error);
    }
    try {
      traceMediaRuntime('POST_PUBLISH_DISPATCHED', { flow: 'post', url: '/posts/{id}/publish' });
      const published = await apiPost<BackendPost>(`/posts/${draft.id}/publish`, undefined, { yeyamoTrace: { flow: 'post', stage: 'POST_PUBLISH' } });
      return { data: { id: published.id } };
    } catch (error) {
      traceMediaRuntime('POST_PUBLISH_ERROR', { flow: 'post', url: '/posts/{id}/publish' });
      throw new PostPublicationError('publish', error);
    }
  },

  deletePost: (postId: EntityId) =>
    apiDelete<void>(`/posts/${postId}`),
};
