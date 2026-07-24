import type { EntityId } from '@/types/api.types';

export interface Place {
  id: EntityId;
  name: string;
  description: string | null;
  city: string;
  address: string;
  lat: number;
  lng: number;
  cover_image_url: string | null;
  category: string;
  rating: number | null;
  reviews_count: number;
  events_count: number;
  posts_count: number;
  equipment?: PlaceEquipment[];
  is_saved: boolean;
  opening_hours?: string;
  phone?: string;
  website?: string;
  price_from?: number;
  price_to?: number;
  currency?: string;
  photos?: string[];
  open_time?: string;
  close_time?: string;
  recent_reviews?: PlaceReview[];
  related_events?: PlaceEvent[];
  similar_events?: PlaceEvent[];
}

export interface PlaceEquipment {
  id: string;
  label: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
}

export interface PlaceReview {
  id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  photos?: string[];
  date: string;
}

export interface PlaceEvent {
  id: EntityId;
  title: string;
  image_url: string;
  date: string;
  time: string;
}

export interface PlacesQuery {
  city?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
}
