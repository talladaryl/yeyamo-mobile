import { getMediaAttachment } from '@/features/media/media.api';
import { apiGet, apiPost } from '@/services/api/client';
import { fallbackUser, mediaContentUrl } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type { Story, StoryViewPayload } from './types';

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
}

export interface CreateStoryPayload {
  mediaId: EntityId;
  caption?: string;
  durationSeconds: number;
}

async function mapStory(story: BackendStory): Promise<Story> {
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
    author: fallbackUser(story.authorId),
    media,
    text: story.caption ?? undefined,
    views_count: story.viewCount,
    viewed: story.viewedByMe,
    duration_seconds: story.durationSeconds,
    expires_at: story.expiresAt,
    created_at: story.createdAt,
  };
}

export const storyApi = {
  getStories: async (): Promise<{ data: Story[] }> => ({
    data: await Promise.all((await apiGet<BackendStory[]>('/stories')).map(mapStory)),
  }),

  getStory: async (storyId: EntityId): Promise<{ data: Story }> => ({
    data: await mapStory(await apiGet<BackendStory>(`/stories/${storyId}`)),
  }),

  createStory: async (payload: CreateStoryPayload): Promise<{ data: Story }> => ({
    data: await mapStory(await apiPost<BackendStory>('/stories', payload)),
  }),

  markViewed: (payload: StoryViewPayload) =>
    apiPost<void>(`/stories/${payload.story_id}/view`),
};
