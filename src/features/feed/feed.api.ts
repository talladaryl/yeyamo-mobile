import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type { EntityId } from '@/types/api.types';
import {
  createIdempotencyKey,
  fallbackUser,
  mediaContentUrl,
  toPaginatedResponse,
} from '@/services/api/contracts';
import { getMediaAttachment } from '@/features/media/media.api';
import { socialApi, type ContentAuthorIdentity } from '@/features/social/social.api';
import { traceFeedRuntime, traceInteractionRuntime } from '@/features/social/social.runtime-trace';
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
  hasNext: boolean;
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

function mapAuthor(authUserId: string, identity?: ContentAuthorIdentity) {
  if (!identity) return fallbackUser(authUserId);
  return {
    id: identity.profileId,
    username: identity.profileId,
    display_name: identity.displayName,
    avatar_url: identity.avatarUrl,
    is_verified: false,
  };
}

function mapComment(comment: BackendComment, identity?: ContentAuthorIdentity): PostComment {
  return {
    id: comment.id,
    author: mapAuthor(comment.authorId, identity),
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

async function mapFeedItem(
  item: OrganicBackendFeedItem,
  identity?: ContentAuthorIdentity,
  interaction?: InteractionSummary,
): Promise<FeedPost> {
  const metadata = await Promise.allSettled(item.mediaIds.map((id) => getMediaAttachment(id)));
  const media = metadata.map((result, index) => result.status === 'fulfilled' ? result.value : fallbackMediaAttachment(item.mediaIds[index]));
  const hasVideo = media.some((attachment) => attachment.type === 'video');
  return {
    id: item.postId,
    type: item.mediaIds.length === 0 ? 'text' : item.mediaIds.length > 1 ? 'carousel' : hasVideo ? 'video' : 'image',
    caption: item.caption,
    media,
    author: mapAuthor(item.authorId, identity),
    author_is_following: identity?.isFollowing ?? false,
    likes_count: interaction?.likes ?? item.likes ?? 0,
    comments_count: interaction?.comments ?? item.comments ?? 0,
    shares_count: interaction?.shares ?? item.shares ?? 0,
    is_liked: interaction?.likedByViewer ?? false,
    is_saved: interaction?.favoriteByViewer ?? false,
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
    const identities = await socialApi.resolveContentAuthorIdentities(organicItems.map((item) => item.authorId));
    const identityByAuthUserId = new Map(identities.map((identity) => [identity.authUserId, identity]));
    const posts = await Promise.all(organicItems.map(async (item) => {
      const interaction = await apiGet<InteractionSummary>(`/interactions/posts/${item.postId}/summary`)
        .catch(() => undefined);
      const post = await mapFeedItem(item, identityByAuthUserId.get(item.authorId), interaction);
      traceFeedRuntime('FEED_ITEM_RESOLVED', {
        flow: 'feed', postId: item.postId, postAuthorId: item.authorId,
        resolvedAuthorId: String(post.author.id),
        hasAuthor: Boolean(identityByAuthUserId.get(item.authorId)),
        mediaCount: post.media.length, likeCount: post.likes_count,
        viewerLiked: post.is_liked, commentCount: post.comments_count,
        hasActiveStory: false,
      });
      return post;
    }));
    return toPaginatedResponse(
      posts,
      response.page,
      response.size,
      response.hasNext,
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
    traceInteractionRuntime('COMMENT_LIST_REQUEST', { flow: 'comment', method: 'GET', postId: String(postId), url: `/interactions/posts/${postId}/comments` });
    const [post, summary, comments] = await Promise.all([
      apiGet<BackendPost>(`/posts/${postId}`),
      apiGet<InteractionSummary>(`/interactions/posts/${postId}/summary`),
      apiGet<BackendComment[]>(`/interactions/posts/${postId}/comments?limit=50`),
    ]);
    traceInteractionRuntime('COMMENT_LIST_RESPONSE', { flow: 'comment', method: 'GET', postId: String(postId), status: 200, count: comments.length });
    const identities = await socialApi.resolveContentAuthorIdentities([
      post.authorId,
      ...comments.map((comment) => comment.authorId),
    ]);
    const identityByAuthUserId = new Map(identities.map((identity) => [identity.authUserId, identity]));
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
    }, identityByAuthUserId.get(post.authorId), summary);
    feedPost.comments = comments.map((comment) => mapComment(comment, identityByAuthUserId.get(comment.authorId)));
    return { data: feedPost };
  },

  addComment: async (postId: EntityId, body: string): Promise<PostComment> => {
    traceInteractionRuntime('COMMENT_SUBMIT', { flow: 'comment', method: 'POST', postId: String(postId), bodyLength: body.length });
    const created = await apiPost<BackendComment>(
      `/interactions/posts/${postId}/comments`,
      { parentId: null, body },
      { headers: { 'Idempotency-Key': createIdempotencyKey() } },
    );
    const [identity] = await socialApi.resolveContentAuthorIdentities([created.authorId]);
    traceInteractionRuntime('COMMENT_CREATE_RESPONSE', { flow: 'comment', method: 'POST', postId: String(postId), commentId: created.id, status: 201 });
    return mapComment(created, identity);
  },

  recordShare: (postId: EntityId) =>
    apiPost<void>(
      `/interactions/posts/${postId}/shares`,
      { channel: 'NATIVE_SHARE' },
      { headers: { 'Idempotency-Key': createIdempotencyKey() } },
    ),
};
