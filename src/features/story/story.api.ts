import { apiGet, apiPost } from '@/services/api/client';
import type { Story, StoryViewPayload } from './types';

export const storyApi = {
  getStories: () =>
    apiGet<{ data: Story[] }>('/stories'),

  getStory: (storyId: number) =>
    apiGet<{ data: Story }>(`/stories/${storyId}`),

  markViewed: (payload: StoryViewPayload) =>
    apiPost<void>(`/stories/${payload.story_id}/view`),
};
