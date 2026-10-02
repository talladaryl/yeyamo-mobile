import type { EntityId, MediaAttachment, UserSummary } from '@/types/api.types';

export type StoryCaptionFont = 'SYSTEM' | 'SERIF' | 'MONOSPACE' | 'SANS_SERIF' | 'CONDENSED';

export interface StoryCaptionStyle {
  font_family: StoryCaptionFont;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export interface Story {
  id: EntityId;
  author: UserSummary;
  /** Auth subject is retained only to determine the connected user's own ring.
   * Public navigation/follow actions continue to use author.id (profile UUID). */
  author_auth_user_id?: string;
  media: MediaAttachment;
  text?: string;
  caption_style?: StoryCaptionStyle;
  /**
   * Preserved from the Content service for generated stories (for example an
   * outing). The viewer deliberately does not navigate from this metadata yet.
   */
  reference_type?: string;
  reference_id?: string | null;
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
