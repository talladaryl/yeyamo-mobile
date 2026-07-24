// Types pour le Social Graph
import type { EntityId, UserSummary } from '@/types/api.types';

export interface SocialStats {
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface UserProfile extends UserSummary {
  bio?: string;
  city?: string;
  cover_url?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  is_followed_by: boolean;
  created_at: string;
}

export interface UserSearchResult extends UserSummary {
  bio?: string;
  city?: string;
  followers_count: number;
  is_following: boolean;
  mutual_friends_count: number;
}

export interface FollowUser extends UserSummary {
  bio?: string;
  city?: string;
  followers_count: number;
  is_following: boolean;
  is_followed_by: boolean;
}

export interface SuggestionUser extends UserSummary {
  bio?: string;
  city?: string;
  followers_count: number;
  mutual_friends_count: number;
  reason: string; // "Based on your interests", "Popular in Yaoundé", etc.
}

export interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'event';
  user: UserSummary;
  target_user?: UserSummary;
  post?: {
    id: EntityId;
    thumbnail_url: string;
  };
  event?: {
    id: EntityId;
    title: string;
  };
  content?: string;
  created_at: string;
}

export interface SearchFilters {
  query?: string;
  location?: string;
  gender?: 'all' | 'male' | 'female';
  interests?: string[];
}

export interface SocialSettings {
  privacy: {
    profile_visibility: 'public' | 'followers' | 'private';
    show_activity: boolean;
    show_followers: boolean;
    show_following: boolean;
  };
  notifications: {
    new_followers: boolean;
    follow_requests: boolean;
    mentions: boolean;
    activity_updates: boolean;
  };
  preferences: {
    allow_suggestions: boolean;
    allow_messages_from_strangers: boolean;
  };
}
