import type { MediaAttachment } from '@/types/api.types';

export interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  city: string | null;
  is_verified: boolean;
  is_partner: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  is_followed_by: boolean;
  created_at: string;
}

export interface ProfilePost {
  id: number;
  type: 'video' | 'image' | 'carousel';
  thumbnail_url: string;
  media: MediaAttachment[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}
