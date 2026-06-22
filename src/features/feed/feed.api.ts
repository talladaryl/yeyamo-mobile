import { apiGet, apiPost, apiDelete } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { FeedPost } from './types';

export const feedApi = {
  getFeed: (cursor?: string) =>
    apiGet<PaginatedResponse<FeedPost>>(
      `/feed${cursor ? `?cursor=${cursor}` : ''}`,
    ),

  likePost: (postId: number) =>
    apiPost<void>(`/posts/${postId}/like`),

  unlikePost: (postId: number) =>
    apiDelete<void>(`/posts/${postId}/like`),

  savePost: (postId: number) =>
    apiPost<void>(`/posts/${postId}/save`),

  unsavePost: (postId: number) =>
    apiDelete<void>(`/posts/${postId}/save`),

  getPost: (postId: number) =>
    apiGet<{ data: FeedPost }>(`/posts/${postId}`),
};
