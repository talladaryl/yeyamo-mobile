import type { UserSummary, MediaAttachment } from '@/types/api.types';

export interface Story {
  id: number;
  author: UserSummary;
  media: MediaAttachment;
  text?: string;
  location_tag?: {
    id: number;
    name: string;
    city: string;
  };
  views_count: number;
  viewed: boolean;
  expires_at: string;
  created_at: string;
}

export interface StoryViewPayload {
  story_id: number;
}
