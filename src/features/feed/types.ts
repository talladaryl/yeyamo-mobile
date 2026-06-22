import type { UserSummary, MediaAttachment } from '@/types/api.types';

export interface FeedPost {
  id: number;
  type: 'video' | 'image' | 'carousel';
  caption: string | null;
  media: MediaAttachment[];
  author: UserSummary;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_saved: boolean;
  place_tag: { id: number; name: string } | null;
  created_at: string;
}
