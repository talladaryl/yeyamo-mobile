import type { EntityId, UserSummary, MediaAttachment } from '@/types/api.types';

export interface FeedPost {
  id: EntityId;
  type: 'video' | 'image' | 'carousel';
  caption: string | null;
  media: MediaAttachment[];
  author: UserSummary;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_saved: boolean;
  place_tag: { id: EntityId; name: string; location?: string; region_id?: number } | null;
  comments?: PostComment[];
  created_at: string;
}

export interface PostComment {
  id: string;
  author: UserSummary;
  text: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}
