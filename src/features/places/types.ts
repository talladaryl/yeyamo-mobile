export interface Place {
  id: number;
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
  currency?: string;
}

export interface PlaceEquipment {
  id: string;
  label: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
}

export interface PlacesQuery {
  city?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
}
