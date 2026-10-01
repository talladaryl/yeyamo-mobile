import { getMediaAttachment } from '@/features/media/media.api';
import { apiGet, apiPost } from '@/services/api/client';
import { fallbackUser, mediaContentUrl } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type { Story, StoryViewPayload } from './types';
import { socialApi, type ContentAuthorIdentity } from '@/features/social/social.api';
import { traceStoryRuntime } from '@/features/social/social.runtime-trace';

interface BackendStory {
  id: string;
  authorId: string;
  mediaId: string;
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  viewedByMe: boolean;
  durationSeconds: number;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface CreateStoryPayload {
  mediaId: EntityId;
  caption?: string;
  durationSeconds: number;
  /** Stable for a retry of one editor submission, never derived from media. */
  idempotencyKey?: string;
}

function mapAuthor(story: BackendStory, identity?: ContentAuthorIdentity) {
  return identity ? {
    id: identity.profileId,
    username: identity.profileId,
    display_name: identity.displayName,
    avatar_url: identity.avatarUrl,
    is_verified: false,
  } : fallbackUser(story.authorId);
}

async function mapStory(story: BackendStory, identity?: ContentAuthorIdentity): Promise<Story> {
  let media: Story['media'];
  try {
    media = await getMediaAttachment(story.mediaId);
  } catch {
    // The id itself is real. Keep the story usable if metadata is temporarily
    // unavailable; a later fetch resolves its real image/video type.
    media = {
      id: story.mediaId,
      url: mediaContentUrl(story.mediaId),
      thumbnail_url: null,
      type: 'image',
      width: 0,
      height: 0,
      duration_seconds: null,
    };
  }

  return {
    id: story.id,
    author: mapAuthor(story, identity),
    author_auth_user_id: story.authorId,
    media,
    text: story.caption ?? undefined,
    reference_type: story.referenceType ?? undefined,
    reference_id: story.referenceId ?? null,
    views_count: story.viewCount,
    viewed: story.viewedByMe,
    duration_seconds: story.durationSeconds,
    expires_at: story.expiresAt,
    created_at: story.createdAt,
  };
}

export const storyApi = {
  getStories: async (): Promise<{ data: Story[] }> => {
    traceStoryRuntime('STORY_ACTIVE_QUERY', { flow: 'story', method: 'GET', url: '/stories' });
    const stories = await apiGet<BackendStory[]>('/stories');
    let identities: ContentAuthorIdentity[] = [];
    try {
      identities = await socialApi.resolveContentAuthorIdentities(stories.map((story) => story.authorId));
    } catch (error) {
      // A profile lookup cannot be allowed to hide canonical active stories.
      traceStoryRuntime('STORY_AUTHOR_RESOLUTION_ERROR', { flow: 'story', requestedAuthorCount: stories.length, errorType: error instanceof Error ? error.name : 'UnknownError' });
    }
    traceStoryRuntime('STORY_AUTHOR_RESOLUTION', { flow: 'story', requestedAuthorCount: stories.length, resolvedAuthorCount: identities.length });
    const byAuthUserId = new Map(identities.map((identity) => [identity.authUserId, identity]));
    const mapped = await Promise.all(stories.map((story) => mapStory(story, byAuthUserId.get(story.authorId))));
    traceStoryRuntime('STORY_ACTIVE_RESPONSE', { flow: 'story', method: 'GET', url: '/stories', receivedState: mapped.length, status: 200 });
    return { data: mapped };
  },

  getStory: async (storyId: EntityId): Promise<{ data: Story }> => {
    const story = await apiGet<BackendStory>(`/stories/${storyId}`);
    const [identity] = await socialApi.resolveContentAuthorIdentities([story.authorId]);
    return { data: await mapStory(story, identity) };
  },

  createStory: async (payload: CreateStoryPayload): Promise<{ data: Story }> => {
    try {
      traceStoryRuntime('STORY_CREATE_REQUEST', { flow: 'story', method: 'POST', url: '/stories', mediaId: String(payload.mediaId) });
      const { idempotencyKey, ...body } = payload;
      const created = await apiPost<BackendStory>('/stories', body, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
        yeyamoTrace: { flow: 'story', stage: 'STORY_CREATE' },
      });
      let identity: ContentAuthorIdentity | undefined;
      try {
        [identity] = await socialApi.resolveContentAuthorIdentities([created.authorId]);
      } catch (error) {
        traceStoryRuntime('STORY_AUTHOR_RESOLUTION_ERROR', { flow: 'story', requestedAuthorCount: 1, errorType: error instanceof Error ? error.name : 'UnknownError' });
      }
      const mapped = await mapStory(created, identity);
      traceStoryRuntime('STORY_CREATE_RESPONSE', { flow: 'story', storyId: String(mapped.id), status: 201, expectedState: 'active' });
      return { data: mapped };
    } catch (error) {
      traceStoryRuntime('STORY_CREATE_ERROR', { flow: 'story', url: '/stories', errorType: error instanceof Error ? error.name : 'UnknownError' });
      throw error;
    }
  },

  markViewed: (payload: StoryViewPayload) =>
    apiPost<void>(`/stories/${payload.story_id}/view`),
};
