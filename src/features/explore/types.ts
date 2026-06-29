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
  rating: number;
  reviews_count: number;
  distance_km: number;
  image_url: string;
  category: string;
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
