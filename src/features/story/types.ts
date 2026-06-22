import type { UserSummary, MediaAttachment } from '@/types/api.types';

export interface Story {
  id: number;
  author: UserSummary;
  media: MediaAttachment;
  viewed: boolean;
  expires_at: string; // ISO — backend handles 24h lifecycle
  created_at: string;
}

export interface StoryViewPayload {
  story_id: number;
}
