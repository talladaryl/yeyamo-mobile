import type { MediaAttachment } from '@/types/api.types';

export interface PlaceSummary {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
    icon: string;
  };
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  photos: string[];
  cover_photo_url: string;
  rating: number;
  reviews_count: number;
  price_range: number;
  amenities: string[];
  opening_hours: string[];
  phone: string | null;
  website: string | null;
  is_verified: boolean;
  is_favorited: boolean;
  is_priority?: boolean;
  created_at: string;
}

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

export interface UserPublication {
  id: number;
  type: 'video' | 'image' | 'carousel';
  media_url: string;
  likes_count: number;
  comments_count: number;
  is_saved: boolean;
  created_at: string;
}

export type Publication = UserPublication;

export interface FavoritePlace extends PlaceSummary {
  favorited_at: string;
  is_priority: boolean;
}

export interface UserEvent {
  id: number;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  place: Pick<PlaceSummary, 'id' | 'name' | 'city'>;
  organizer: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  current_participants: number;
  participants: unknown[];
  price: number | null;
  visibility: 'public' | 'private';
  allow_strangers: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  user_participation_status: 'going' | 'interested' | 'declined';
  created_at: string;
}

export interface EventParticipation {
  id: number;
  event: UserEvent;
  status: 'confirmed' | 'pending' | 'cancelled';
  participants: unknown[];
  participants_preview?: Array<{
    id: number;
    avatar_url: string | null;
  }>;
  participants_count: number;
  total_participants?: number;
  joined_at: string;
}

export interface Reservation {
  id: number;
  place: PlaceSummary;
  reservation_date: string;
  guests_count: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  created_at: string;
}

export interface UserReview {
  id: number;
  place: PlaceSummary;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

export interface ProfileStats {
  publications_count: number;
  followers_count: number;
  following_count: number;
}
