import type { EntityId, MediaAttachment, UserSummary } from '@/types/api.types';

export interface Story {
  id: EntityId;
  author: UserSummary;
  media: MediaAttachment;
  text?: string;
  location_tag?: {
    id: EntityId;
    name: string;
    city: string;
  };
  views_count: number;
  viewed: boolean;
  /** Server-defined display duration, constrained by the API to 5–60 seconds. */
  duration_seconds: number;
  expires_at: string;
  created_at: string;
}

export interface StoryViewPayload {
  story_id: EntityId;
}

export interface StoryAuthorGroup {
  author: UserSummary;
  stories: Story[];
  /** A ring is viewed only when every active item in it was viewed. */
  viewed: boolean;
}

/**
 * The API returns a flat list. Preserve every active story in an author
 * sequence instead of dropping all but the first item at the ring level.
 */
export function groupActiveStories(stories: Story[], now = Date.now()): StoryAuthorGroup[] {
  const groups = new Map<string, StoryAuthorGroup>();

  stories
    .filter((story) => new Date(story.expires_at).getTime() > now)
    .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
    .forEach((story) => {
      const key = String(story.author.id);
      const existing = groups.get(key);
      if (existing) {
        existing.stories.push(story);
        existing.viewed = existing.stories.every((item) => item.viewed);
        return;
      }
      groups.set(key, { author: story.author, stories: [story], viewed: story.viewed });
    });

  return [...groups.values()];
}
