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
    const draft = await apiPost<BackendPost>('/posts', {
      caption: payload.caption,
      visibility: 'PUBLIC',
      catalogAssetId: payload.place_id ?? null,
      mediaIds: payload.media_ids,
      hashtags: [],
      ...(payload.target_type && payload.target_id ? { targetType: payload.target_type, targetId: payload.target_id } : {}),
    });
    const published = await apiPost<BackendPost>(`/posts/${draft.id}/publish`);
    return { data: { id: published.id } };
  },

  createStory: async (mediaId: EntityId, durationSeconds = 15): Promise<{ data: { id: EntityId } }> => {
    const story = await apiPost<{ id: string }>('/stories', {
      mediaId,
      durationSeconds,
    });
    return { data: { id: story.id } };
  },

  deletePost: (postId: EntityId) =>
    apiDelete<void>(`/posts/${postId}`),
};
