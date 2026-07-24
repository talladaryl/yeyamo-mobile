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
}

function mapStory(story: BackendStory): Story {
  return {
    id: story.id,
    author: fallbackUser(story.authorId),
    media: {
      id: story.mediaId,
      url: mediaContentUrl(story.mediaId),
      thumbnail_url: null,
      type: 'image',
      width: 0,
      height: 0,
      duration_seconds: null,
    },
    text: story.caption ?? undefined,
    views_count: story.viewCount,
    viewed: story.viewedByMe,
    expires_at: story.expiresAt,
    created_at: story.createdAt,
  };
}

export const storyApi = {
  getStories: async (): Promise<{ data: Story[] }> => ({
    data: (await apiGet<BackendStory[]>('/stories')).map(mapStory),
  }),

  getStory: async (storyId: EntityId): Promise<{ data: Story }> => ({
    data: mapStory(await apiGet<BackendStory>(`/stories/${storyId}`)),
  }),

  markViewed: (payload: StoryViewPayload) =>
    apiPost<void>(`/stories/${payload.story_id}/view`),
};
