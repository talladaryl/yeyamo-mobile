import type { EntityId } from '@/types/api.types';

export interface Place {
  id: EntityId;
  name: string;
  description: string | null;
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  cover_image_url: string | null;
  category?: string | null;
  rating: number | null;
  reviews_count?: number | null;
  events_count?: number | null;
  posts_count?: number | null;
  equipment?: PlaceEquipment[];
  is_saved?: boolean;
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
  categoryCode?: string;
}

/** Créneau réservable exposé par booking-service. */
export interface BackendActivity {
  id: string;
  activityId: string;
  placeId: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reserved: number;
  available: number;
  unitPrice: number;
  isPaid: boolean;
  amount: number;
  currency: string | null;
  countryCode: string | null;
  status: string;
}

/** Réponse Spring Data de GET /activities. */
export interface BackendActivityPage {
  content: BackendActivity[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface BackendBooking {
  id: string;
  reference: string;
  activityId: string;
  slotId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface CreateActivityBookingInput {
  slotId: EntityId;
  quantity: number;
  operator?: 'mtn' | 'orange';
  phoneNumber?: string;
}
