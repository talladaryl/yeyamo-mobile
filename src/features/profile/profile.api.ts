import { apiClient } from '@/services/api/client';
import { collectionsApi } from '@/features/collections/collections.api';
import { mediaContentUrl } from '@/services/api/contracts';
import { secureStore } from '@/services/storage/secure-store';
import type {
  EventParticipation,
  FavoritePlace,
  PlaceSummary,
  ProfileStats,
  Reservation,
  UserPublication,
  UserReview,
} from './types';

interface BackendPost {
  id: string;
  mediaIds: string[];
  createdAt: string;
}

interface BackendEvent {
  id: string;
  placeId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  capacity: number | null;
  registeredCount: number;
  status: string;
  createdAt: string;
}

interface BackendBooking {
  id: string;
  activityId: string;
  quantity: number;
  status: string;
  createdAt: string;
}

interface BackendReview {
  id: string;
  placeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface BackendStats {
  followersCount: number;
  followingCount: number;
}

function emptyPlace(id: string, name: string): PlaceSummary {
  return {
    id,
    name,
    category: { id: 'unknown', name: 'Non renseigné', icon: 'location' },
    address: '',
    city: '',
    region: '',
    latitude: 0,
    longitude: 0,
    photos: [],
    cover_photo_url: '',
    rating: 0,
    reviews_count: 0,
    price_range: 0,
    amenities: [],
    opening_hours: [],
    phone: null,
    website: null,
    is_verified: false,
    is_favorited: false,
    created_at: '',
  };
}

export const profileApi = {
  getUserPublications: async (): Promise<UserPublication[]> => {
    const { data } = await apiClient.get<BackendPost[]>('/posts/me');
    return data.map((post) => ({
      id: post.id,
      type: post.mediaIds.length > 1 ? 'carousel' : 'image',
      media_url: post.mediaIds[0] ? mediaContentUrl(post.mediaIds[0]) : '',
      likes_count: 0,
      comments_count: 0,
      is_saved: false,
      created_at: post.createdAt,
    }));
  },

  getUserFavorites: async (): Promise<FavoritePlace[]> => {
    const collections = await collectionsApi.getUserCollections();
    const details = await Promise.all(collections.map((item) => collectionsApi.getCollection(item.id)));
    const unique = new Map<string, FavoritePlace>();
    details.flatMap((collection) => collection.places).forEach((place) => {
      unique.set(String(place.id), {
        ...place,
        category: { ...place.category, icon: place.category.icon ?? 'location' },
        cover_photo_url: place.cover_photo_url,
        price_range: place.price_range ?? 0,
        is_favorited: true,
        favorited_at: place.added_at,
        is_priority: place.is_priority ?? false,
      });
    });
    return [...unique.values()];
  },

  getUserEvents: async (): Promise<EventParticipation[]> => {
    const { data } = await apiClient.get<BackendEvent[]>('/events/me');
    return data.map((event) => ({
      id: event.id,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        cover_image_url: null,
        place: {
          id: event.placeId,
          name: 'Lieu de l’événement',
          city: '',
        },
        organizer: {
          id: 'unknown',
          username: 'organisateur',
          display_name: 'Organisateur',
          avatar_url: null,
          is_verified: false,
        },
        start_date: event.startAt,
        end_date: event.endAt,
        max_participants: event.capacity,
        current_participants: event.registeredCount,
        participants: [],
        price: null,
        visibility: 'public',
        allow_strangers: true,
        status: event.status.toLowerCase() as EventParticipation['event']['status'],
        user_participation_status: 'going',
        created_at: event.createdAt,
      },
      status: 'confirmed',
      participants: [],
      participants_count: event.registeredCount,
      total_participants: event.registeredCount,
      joined_at: event.createdAt,
    }));
  },

  getUserReservations: async (): Promise<Reservation[]> => {
    const { data } = await apiClient.get<BackendBooking[]>('/bookings/me');
    return data.map((booking) => ({
      id: booking.id,
      place: emptyPlace(booking.activityId, `Activité ${booking.activityId}`),
      reservation_date: booking.createdAt,
      guests_count: booking.quantity,
      status: booking.status.toLowerCase() as Reservation['status'],
      created_at: booking.createdAt,
    }));
  },

  getUserReviews: async (): Promise<UserReview[]> => {
    const userId = await secureStore.get(secureStore.KEYS.USER_ID);
    if (!userId) return [];
    const { data } = await apiClient.get<BackendReview[]>(
      `/interactions/users/${encodeURIComponent(userId)}/reviews`,
    );
    return data.map((review) => ({
      id: review.id,
      place: emptyPlace(review.placeId, `Lieu ${review.placeId}`),
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
      helpful_count: 0,
    }));
  },

  getProfileStats: async (): Promise<ProfileStats> => {
    const [{ data: stats }, publications] = await Promise.all([
      apiClient.get<BackendStats>('/users/social/stats'),
      profileApi.getUserPublications(),
    ]);
    return {
      publications_count: publications.length,
      followers_count: stats.followersCount,
      following_count: stats.followingCount,
    };
  },
};
