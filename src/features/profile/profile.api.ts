import { apiClient, apiPost } from '@/services/api/client';
import { collectionsApi } from '@/features/collections/collections.api';
import { createIdempotencyKey, mediaContentUrl, type SpringPage } from '@/services/api/contracts';
import { secureStore } from '@/services/storage/secure-store';
import { getMediaAttachments } from '@/features/media/media.api';
import { traceProfileRuntime } from '@/features/social/social.runtime-trace';
import type { MediaAttachment } from '@/types/api.types';
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
  caption?: string | null;
  content?: string | null;
  status?: string | null;
}

interface BackendLikedPost {
  postId: string;
  likedAt: string;
}

interface BackendSavedPost {
  postId: string;
  savedAt: string;
}

interface BackendInteractionSummary {
  postId: string;
  likes: number;
  views: number;
  favoriteByViewer: boolean;
}

interface BackendEvent {
  id: string;
  placeId: string;
  title: string;
  locationName?: string | null;
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
  reference: string;
  activityId: string;
  slotId: string;
  quantity: number;
  unitPrice: number | null;
  totalAmount: number | null;
  currency: string | null;
  status: string;
  paymentStatus: string | null;
  cancellationReason: string | null;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  automaticRefundAvailable: boolean;
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

function mapReservation(booking: BackendBooking): Reservation {
  return {
    id: booking.id,
    reference: booking.reference,
    activity_id: booking.activityId,
    unit_price: booking.unitPrice,
    total_amount: booking.totalAmount,
    currency: booking.currency,
    payment_status: booking.paymentStatus,
    cancellation_reason: booking.cancellationReason,
    confirmed_at: booking.confirmedAt,
    cancelled_at: booking.cancelledAt,
    completed_at: booking.completedAt,
    automatic_refund_available: booking.automaticRefundAvailable,
    // booking-service returns references and amounts, not an activity/place summary.
    place: emptyPlace(booking.activityId, 'Informations de réservation non fournies'),
    reservation_date: booking.createdAt,
    guests_count: booking.quantity,
    status: booking.status.toLowerCase() as Reservation['status'],
    created_at: booking.createdAt,
  };
}

export const profileApi = {
  getUserPublications: async (): Promise<UserPublication[]> => {
    traceProfileRuntime('PROFILE_POSTS_REQUEST', { flow: 'profile', method: 'GET', url: '/posts/me' });
    const { data } = await apiClient.get<BackendPost[]>('/posts/me');
    traceProfileRuntime('PROFILE_POSTS_RESPONSE', { flow: 'profile', method: 'GET', url: '/posts/me', status: 200, postCount: data.length });
    return mapProfilePosts(data);
  },

  getLikedPublications: async (): Promise<UserPublication[]> => {
    traceProfileRuntime('PROFILE_LIKES_REQUEST', { flow: 'profile', method: 'GET', url: '/interactions/me/likes' });
    const { data: likes } = await apiClient.get<BackendLikedPost[]>('/interactions/me/likes');
    traceProfileRuntime('PROFILE_LIKES_RESPONSE', { flow: 'profile', method: 'GET', url: '/interactions/me/likes', status: 200, postCount: likes.length });
    if (!likes.length) return [];
    const query = likes.map(({ postId }) => `ids=${encodeURIComponent(postId)}`).join('&');
    const { data: posts } = await apiClient.get<BackendPost[]>(`/posts/batch?${query}`);
    return mapProfilePosts(posts);
  },

  getSavedPublications: async (): Promise<UserPublication[]> => {
    traceProfileRuntime('PROFILE_SAVED_REQUEST', { flow: 'profile', method: 'GET', url: '/saves' });
    const { data: saved } = await apiClient.get<BackendSavedPost[]>('/saves');
    traceProfileRuntime('PROFILE_SAVED_RESPONSE', { flow: 'profile', method: 'GET', url: '/saves', status: 200, postCount: saved.length });
    if (!saved.length) return [];
    const query = saved.map(({ postId }) => `ids=${encodeURIComponent(postId)}`).join('&');
    const { data: posts } = await apiClient.get<BackendPost[]>(`/posts/batch?${query}`);
    const mapped = await mapProfilePosts(posts, new Set(saved.map(({ postId }) => String(postId))));
    const byId = new Map(mapped.map((post) => [String(post.id), post]));
    return saved.map(({ postId }) => byId.get(String(postId))).filter((post): post is UserPublication => Boolean(post));
  },

  getPublicationsByAuthor: async (authorId: string): Promise<UserPublication[]> => {
    const { data } = await apiClient.get<BackendPost[]>(`/posts/authors/${encodeURIComponent(authorId)}`);
    return mapProfilePosts(data);
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
          name: event.locationName ?? 'Lieu non renseigné',
          city: '',
        },
        organizer: {
          id: event.id,
          username: '',
          display_name: '',
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

  getUserReservations: async (page = 0, size = 20): Promise<SpringPage<Reservation>> => {
    const { data } = await apiClient.get<SpringPage<BackendBooking>>('/bookings/me', { params: { page, size } });
    return { ...data, content: data.content.map(mapReservation) };
  },

  cancelUserReservation: async (id: string, reason: string, idempotencyKey = createIdempotencyKey()): Promise<Reservation> => {
    const { data } = await apiClient.post<BackendBooking>(`/bookings/${encodeURIComponent(id)}/cancel`, { reason }, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return mapReservation(data);
  },

  getUserReviews: async (): Promise<UserReview[]> => {
    const userId = await secureStore.get(secureStore.KEYS.USER_ID);
    if (!userId) return [];
    const { data } = await apiClient.get<BackendReview[]>(
      `/interactions/users/${encodeURIComponent(userId)}/reviews`,
    );
    return data.map((review) => ({
      id: review.id,
      place: emptyPlace(review.placeId, 'Lieu non renseigné'),
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
      helpful_count: 0,
    }));
  },

  getProfileStats: async (): Promise<ProfileStats> => {
    const { data: stats } = await apiClient.get<BackendStats>('/users/social/stats');
    const result = {
      // The canonical profile-post query owns this count. Keeping it out of
      // social stats prevents a second competing GET /posts/me request.
      publications_count: 0,
      followers_count: stats.followersCount,
      following_count: stats.followingCount,
    };
    return result;
  },
};

/** Maps posts using one batch request and intentionally has no N+1 fallback. */
export async function mapProfilePosts(posts: BackendPost[], savedPostIds: ReadonlySet<string> = new Set()): Promise<UserPublication[]> {
  const mediaIds = [...new Set(posts.flatMap((post) => post.mediaIds ?? []).map(String).filter(Boolean))];
  traceProfileRuntime('PROFILE_MEDIA_BATCH_REQUEST', { flow: 'profile', postCount: posts.length, uniqueMediaCount: mediaIds.length });
  let mediaById = new Map<string, MediaAttachment>();
  if (mediaIds.length) {
    try {
      mediaById = await getMediaAttachments(mediaIds);
    } catch (error) {
      traceProfileRuntime('PROFILE_MEDIA_RESOLUTION_ERROR', { flow: 'profile', request: 'batch', errorType: error instanceof Error ? error.name : 'UnknownError' });
    }
  }
  traceProfileRuntime('PROFILE_MEDIA_BATCH_RESPONSE', { flow: 'profile', requestedCount: mediaIds.length, resolvedCount: mediaById.size });
  const summariesByPostId = new Map<string, BackendInteractionSummary>();
  if (posts.length) {
    try {
      const summaries = await apiPost<BackendInteractionSummary[]>('/interactions/posts/summaries', { postIds: posts.map((post) => post.id) });
      summaries.forEach((summary) => summariesByPostId.set(String(summary.postId), summary));
    } catch (error) {
      traceProfileRuntime('PROFILE_INTERACTION_SUMMARIES_ERROR', { flow: 'profile', postCount: posts.length, errorType: error instanceof Error ? error.name : 'UnknownError' });
    }
  }
  return posts.map((post) => {
    const firstMediaId = post.mediaIds?.[0] ?? null;
    const attachment = firstMediaId ? mediaById.get(String(firstMediaId)) : undefined;
    const hasMedia = Boolean(firstMediaId);
    const type = !hasMedia ? 'text' : (post.mediaIds?.length ?? 0) > 1 ? 'carousel' : attachment?.type ?? 'image';
    const interaction = summariesByPostId.get(String(post.id));
    traceProfileRuntime('PROFILE_POST_MEDIA_RESOLVE', { postId: post.id, mediaId: firstMediaId, found: Boolean(attachment?.url), mediaType: attachment?.type ?? 'text' });
    return {
      id: post.id,
      type,
      media_url: attachment?.thumbnail_url ?? attachment?.url ?? (firstMediaId ? mediaContentUrl(firstMediaId) : ''),
      media_id: firstMediaId,
      media_type: attachment?.type ?? null,
      caption: post.caption ?? post.content ?? null,
      likes_count: interaction?.likes ?? 0,
      views_count: interaction?.views ?? 0,
      is_saved: savedPostIds.has(String(post.id)) || interaction?.favoriteByViewer === true,
      created_at: post.createdAt,
    };
  });
}
