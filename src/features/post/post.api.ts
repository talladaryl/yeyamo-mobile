import { apiPost, apiDelete } from '@/services/api/client';
import { absoluteApiUrl } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type { CreatePostPayload, UploadedMedia } from './types';

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
    const media = await apiPost<BackendMedia>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
      draft = await apiPost<BackendPost>('/posts', {
        caption: payload.caption,
        visibility: 'PUBLIC',
        catalogAssetId: payload.place_id ?? null,
        mediaIds: payload.media_ids,
        hashtags: [],
        ...(payload.target_type && payload.target_id ? { targetType: payload.target_type, targetId: payload.target_id } : {}),
      });
    } catch (error) {
      throw new PostPublicationError('create', error);
    }
    try {
      const published = await apiPost<BackendPost>(`/posts/${draft.id}/publish`);
      return { data: { id: published.id } };
    } catch (error) {
      throw new PostPublicationError('publish', error);
    }
  },

  deletePost: (postId: EntityId) =>
    apiDelete<void>(`/posts/${postId}`),
};
