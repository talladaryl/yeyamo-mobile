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
  events_count: number;
  posts_count: number;
}

export interface PlacesQuery {
  city?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
}
