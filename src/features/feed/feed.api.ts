import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type { EntityId } from '@/types/api.types';
import {
  createIdempotencyKey,
  fallbackUser,
  mediaContentUrl,
  toPaginatedResponse,
} from '@/services/api/contracts';
import { getMediaAttachment } from '@/features/media/media.api';
import type { FeedPost , PostComment } from './types';

interface BackendFeedItem {
  itemType?: 'ORGANIC' | 'SPONSORED';
  postId: string | null;
  authorId: string | null;
  caption: string | null;
  catalogAssetId: string | null;
  mediaIds: string[] | null;
  hashtags: string[] | null;
  publishedAt: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  linkedContent?: { type: 'PROVERB' | 'RECIPE'; id: string; title: string | null } | null;
}

interface BackendFeedPage {
  page: number;
  size: number;
  items: BackendFeedItem[];
}

type OrganicBackendFeedItem = BackendFeedItem & {
  postId: string;
  authorId: string;
  mediaIds: string[];
  publishedAt: string;
};

function isOrganicFeedItem(item: BackendFeedItem): item is OrganicBackendFeedItem {
  // FeedPage can contain backend-injected sponsored rows. They intentionally
  // have no post or media fields and must not be decoded as social posts.
  return item.itemType !== 'SPONSORED'
    && typeof item.postId === 'string'
    && typeof item.authorId === 'string'
    && Array.isArray(item.mediaIds)
    && typeof item.publishedAt === 'string';
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

function fallbackMediaAttachment(id: string) {
  return {
    id,
    url: mediaContentUrl(id),
    thumbnail_url: null,
    // The feed DTO does not expose a MIME. This fallback retains the real ID
    // and lets the image renderer fail visibly instead of fabricating a URL.
    type: 'image' as const,
    width: 0,
    height: 0,
    duration_seconds: null,
  };
}

async function mapFeedItem(item: OrganicBackendFeedItem): Promise<FeedPost> {
  const metadata = await Promise.allSettled(item.mediaIds.map((id) => getMediaAttachment(id)));
  const media = metadata.map((result, index) => result.status === 'fulfilled' ? result.value : fallbackMediaAttachment(item.mediaIds[index]));
  const hasVideo = media.some((attachment) => attachment.type === 'video');
  return {
    id: item.postId,
    type: item.mediaIds.length === 0 ? 'text' : item.mediaIds.length > 1 ? 'carousel' : hasVideo ? 'video' : 'image',
    caption: item.caption,
    media,
    author: fallbackUser(item.authorId),
    likes_count: item.likes ?? 0,
    comments_count: item.comments ?? 0,
    shares_count: item.shares ?? 0,
    is_liked: false,
    is_saved: false,
    place_tag: item.catalogAssetId
      ? { id: item.catalogAssetId, name: 'Lieu associé' }
      : null,
    created_at: item.publishedAt,
    linkedContent: item.linkedContent ?? null,
    media_metadata_complete: metadata.every((result) => result.status === 'fulfilled'),
  };
}

export const feedApi = {
  getFeed: async (pageParam?: number) => {
    const page = Number.isInteger(pageParam) && pageParam! >= 0 ? pageParam! : 0;
    const response = await apiGet<BackendFeedPage>(`/feed?page=${page}&size=20`);
    const organicItems = (response.items ?? []).filter(isOrganicFeedItem);
    const posts = await Promise.all(organicItems.map(mapFeedItem));
    return toPaginatedResponse(
      posts,
      response.page,
      response.size,
      (response.items ?? []).length === response.size,
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
    const feedPost = await mapFeedItem({
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

  recordShare: (postId: EntityId) =>
    apiPost<void>(
      `/interactions/posts/${postId}/shares`,
      { channel: 'NATIVE_SHARE' },
      { headers: { 'Idempotency-Key': createIdempotencyKey() } },
    ),
};
