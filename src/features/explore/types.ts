// ─── Explorer Types ─────────────────────────────────────────────────────────

export type ExploreCategory = 
  | 'attractions' 
  | 'events' 
  | 'experiences' 
  | 'restaurants' 
  | 'hotels'
  | 'culture'
  | 'languages'
  | 'artworks'
  | 'artisans'
  | 'challenges'
  | 'all';

export interface Category {
  id: string;
  label: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
}

export interface TrendingPlace {
  id: EntityId;
  name: string;
  city: string;
  region_id: EntityId;
  rating?: number | null;
  reviews_count?: number | null;
  distance_km?: number | null;
  image_url?: string | null;
  category: string;
}

export const EXPLORE_CATEGORY_DEFINITIONS: Category[] = [
  { id: 'attractions', label: 'Attractions', icon: 'location-outline', iconLibrary: 'ionicons' },
  { id: 'events', label: 'Événements', icon: 'calendar-outline', iconLibrary: 'ionicons' },
  { id: 'experiences', label: 'Expériences', icon: 'compass-outline', iconLibrary: 'ionicons' },
  { id: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline', iconLibrary: 'ionicons' },
  { id: 'hotels', label: 'Hôtels', icon: 'bed-outline', iconLibrary: 'ionicons' },
  { id: 'culture', label: 'Culture', icon: 'leaf-outline', iconLibrary: 'ionicons' },
  { id: 'languages', label: 'Langues', icon: 'language-outline', iconLibrary: 'ionicons' },
  { id: 'artworks', label: 'Œuvres à découvrir', icon: 'color-palette-outline', iconLibrary: 'ionicons' },
  { id: 'artisans', label: 'Artisans près de vous', icon: 'people-outline', iconLibrary: 'ionicons' },
  { id: 'challenges', label: 'Défis', icon: 'trophy-outline', iconLibrary: 'ionicons' },
];

export interface Place {
  id: EntityId;
  name: string;
  category: {
    id: EntityId;
    name: string;
    icon?: string;
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
  price_range?: number;
  amenities: string[];
  opening_hours: string[];
  phone: string | null;
  website: string | null;
  is_verified: boolean;
  is_favorited?: boolean;
  created_at: string;
}

export interface Region {
  id: number;
  code?: string;
  name: string;
  description: string;
  places_count: number;
  events_count: number;
  experiences_count: number;
  cover_image_url: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchFilters {
  category: ExploreCategory;
  region: string | null;
  min_rating: number;
  max_distance_km: number;
  date: Date | null;
  min_price: number;
  max_price: number;
  sort_by: 'distance' | 'rating' | 'price' | 'popular';
}

export interface MapPlace {
  id: EntityId;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating?: number | null;
  image_url?: string | null;
  category?: string | null;
}

export interface UpcomingEvent {
  id: EntityId;
  title: string;
  date_start: string;
  date_end: string;
  location?: string | null;
  image_url?: string | null;
  attendees_count: number;
}
import type { EntityId } from '@/types/api.types';
