import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { EntityId } from '@/types/api.types';
import {
  createIdempotencyKey,
  fallbackUser,
  mediaContentUrl,
  toPaginatedResponse,
} from '@/services/api/contracts';
import type { FeedPost } from './types';
import type { PostComment } from './types';

interface BackendFeedItem {
  postId: string;
  authorId: string;
  caption: string | null;
  catalogAssetId: string | null;
  mediaIds: string[];
  hashtags: string[];
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  linkedContent?: { type: 'PROVERB' | 'RECIPE'; id: string; title: string | null } | null;
}

interface BackendFeedPage {
  page: number;
  size: number;
  items: BackendFeedItem[];
}

interface BackendPost {
  id: string;
  authorId: string;
  caption: string | null;
  catalogAssetId: string | null;
  mediaIds: string[];
  publishedAt: string | null;
  createdAt: string;
  linkedContent?: { type: 'PROVERB' | 'RECIPE'; id: string; title: string | null } | null;
}

interface InteractionSummary {
  likes: number;
  comments: number;
  shares: number;
  likedByViewer: boolean;
  favoriteByViewer: boolean;
}

interface BackendComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

function mapComment(comment: BackendComment): PostComment {
  return {
    id: comment.id,
    author: fallbackUser(comment.authorId),
    text: comment.body,
    likes_count: 0,
    is_liked: false,
    created_at: comment.createdAt,
  };
}

function mapFeedItem(item: BackendFeedItem): FeedPost {
  return {
    id: item.postId,
    type: item.mediaIds.length > 1 ? 'carousel' : 'image',
    caption: item.caption,
    media: item.mediaIds.map((id) => ({
      id,
      url: mediaContentUrl(id),
      thumbnail_url: null,
      type: 'image',
      width: 0,
      height: 0,
      duration_seconds: null,
    })),
    author: fallbackUser(item.authorId),
    likes_count: item.likes,
    comments_count: item.comments,
    shares_count: item.shares,
    is_liked: false,
    is_saved: false,
    place_tag: item.catalogAssetId
      ? { id: item.catalogAssetId, name: 'Lieu associé' }
      : null,
    created_at: item.publishedAt,
    linkedContent: item.linkedContent ?? null,
  };
}

export const feedApi = {
  getFeed: async (cursor?: string, _interests: string[] = [], _regionId?: number) => {
    const page = Number.parseInt(cursor ?? '0', 10) || 0;
    const response = await apiGet<BackendFeedPage>(`/feed?page=${page}&size=20`);
    return toPaginatedResponse(
      response.items.map(mapFeedItem),
      response.page,
      response.size,
      response.items.length === response.size,
    );
  },

  likePost: (postId: EntityId) =>
    apiPut<void>(`/interactions/posts/${postId}/like`, undefined, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    }),

  unlikePost: (postId: EntityId) =>
    apiDelete<void>(`/interactions/posts/${postId}/like`, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    }),

  savePost: (postId: EntityId) =>
    apiPut<void>(`/interactions/posts/${postId}/favorite`, undefined, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    }),

  unsavePost: (postId: EntityId) =>
    apiDelete<void>(`/interactions/posts/${postId}/favorite`, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    }),

  getPost: async (postId: EntityId): Promise<{ data: FeedPost }> => {
    const [post, summary, comments] = await Promise.all([
      apiGet<BackendPost>(`/posts/${postId}`),
      apiGet<InteractionSummary>(`/interactions/posts/${postId}/summary`),
      apiGet<BackendComment[]>(`/interactions/posts/${postId}/comments?limit=50`),
    ]);
    const feedPost = mapFeedItem({
      postId: post.id,
      authorId: post.authorId,
      caption: post.caption,
      catalogAssetId: post.catalogAssetId,
      mediaIds: post.mediaIds,
      hashtags: [],
      publishedAt: post.publishedAt ?? post.createdAt,
      likes: summary.likes,
      comments: summary.comments,
      shares: summary.shares,
      linkedContent: post.linkedContent ?? null,
    });
    feedPost.is_liked = summary.likedByViewer;
    feedPost.is_saved = summary.favoriteByViewer;
    feedPost.comments = comments.map(mapComment);
    return { data: feedPost };
  },

  addComment: async (postId: EntityId, body: string): Promise<PostComment> =>
    mapComment(await apiPost<BackendComment>(
      `/interactions/posts/${postId}/comments`,
      { parentId: null, body },
      { headers: { 'Idempotency-Key': createIdempotencyKey() } },
    )),
};
