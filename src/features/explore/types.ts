// ─── Explorer Types ─────────────────────────────────────────────────────────

export type ExploreCategory = 
  | 'attractions' 
  | 'events' 
  | 'experiences' 
  | 'restaurants' 
  | 'hotels'
  | 'all';

export interface Category {
  id: ExploreCategory;
  label: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
}

export interface TrendingPlace {
  id: number;
  name: string;
  city: string;
  region_id: number;
  rating: number;
  reviews_count: number;
  distance_km: number;
  image_url: string;
  category: string;
}

export interface Place {
  id: number;
  name: string;
  category: {
    id: number;
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
  id: number;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  image_url: string;
  category: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date_start: string;
  date_end: string;
  location: string;
  image_url: string;
  attendees_count: number;
}
