import { apiGet, apiPost, apiDelete } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { FeedPost } from './types';

export const feedApi = {
  getFeed: (cursor?: string, interests: string[] = []) => {
    const params = [
      cursor ? `cursor=${encodeURIComponent(cursor)}` : null,
      interests.length ? `interests=${encodeURIComponent(interests.join(','))}` : null,
    ].filter(Boolean);

    return (
    apiGet<PaginatedResponse<FeedPost>>(
      `/feed${params.length ? `?${params.join('&')}` : ''}`,
    ));
  },

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
