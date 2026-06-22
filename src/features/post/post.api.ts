import { apiPost, apiDelete } from '@/services/api/client';
import type { CreatePostPayload, UploadedMedia } from './types';

export const postApi = {
  uploadMedia: (formData: FormData) =>
    apiPost<{ data: UploadedMedia }>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  createPost: (payload: CreatePostPayload) =>
    apiPost<{ data: { id: number } }>('/posts', payload),

  createStory: (mediaId: number) =>
    apiPost<{ data: { id: number } }>('/stories', { media_id: mediaId }),

  deletePost: (postId: number) =>
    apiDelete<void>(`/posts/${postId}`),
};
