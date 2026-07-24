import type { EntityId, UserSummary, MediaAttachment } from '@/types/api.types';

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
  expires_at: string;
  created_at: string;
}

export interface StoryViewPayload {
  story_id: EntityId;
}
