import { apiGet, apiPost } from '@/services/api/client';
import { normalizeDiscoveryId } from '@/features/discovery/discovery.navigation';
import { createIdempotencyKey, toPaginatedResponse } from '@/services/api/contracts';
import type { EntityId, PaginatedResponse } from '@/types/api.types';
import type {
  BackendActivity,
  BackendActivityPage,
  BackendBooking,
  CreateActivityBookingInput,
  Place,
  PlacesQuery,
} from './types';

interface BackendPlaceSummary {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  categoryName: string | null;
}

interface BackendPlace extends BackendPlaceSummary {
  description: string | null;
  cityName: string;
  regionName: string;
  phone: string | null;
  website: string | null;
  status: string;
  media: Array<{ url: string }>;
  schedules: Array<{ dayOfWeek: number; openTime: string; closeTime: string }>;
}

export interface PlaceCategoryReference { id: number; name: string; active: boolean; }
export interface PlaceRegionReference { id: number; name: string; active: boolean; }
export interface PlaceCityReference { id: string; regionId: number; name: string; active: boolean; }
export interface CreatePlaceInput { partnerId: string; categoryId: number; regionId: number; cityId: string; name: string; latitude: number; longitude: number; address?: string; phone?: string; website?: string; status: 'DRAFT' | 'PENDING'; }
export interface PartnerPlaceReference { id: string; name: string; status: 'PUBLISHED'; }
export interface PartnerPlacePage {
  content: PartnerPlaceReference[];
  page?: { size: number; number: number; totalElements: number; totalPages: number };
}

interface DiscoveryDocument {
  sourceId: string;
  title: string;
  description: string | null;
  categoryCode: string | null;
  regionCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  publishedAt: string | null;
}

interface DiscoveryPage {
  page: number;
  size: number;
  hasNext: boolean;
  items: DiscoveryDocument[];
}

function basePlace(item: BackendPlaceSummary): Place {
  return {
    id: item.id,
    name: item.name,
    description: null,
    city: null,
    address: item.address,
    lat: item.latitude,
    lng: item.longitude,
    cover_image_url: null,
    category: item.categoryName,
    rating: null,
    reviews_count: null,
    events_count: null,
    posts_count: null,
  };
}

export const placesApi = {
  categories: () => apiGet<PlaceCategoryReference[]>('/categories'),
  regions: () => apiGet<PlaceRegionReference[]>('/regions'),
  cities: (regionId: number) => apiGet<PlaceCityReference[]>(`/cities/region/${regionId}`),
  myPlaces: () => apiGet<PartnerPlacePage>('/places/me?page=0&size=20'),
  createPlace: (input: CreatePlaceInput) => apiPost<BackendPlace>('/places', input),
  getPlaces: async (query: PlacesQuery): Promise<PaginatedResponse<Place>> => {
    const page = query.page ?? 0;
    if (query.lat != null && query.lng != null) {
      const params = new URLSearchParams({
        lat: String(query.lat),
        lng: String(query.lng),
        radiusKm: String(query.radius_km ?? 5),
        limit: '20',
      });
      const items = await apiGet<BackendPlaceSummary[]>(`/places/nearby?${params}`);
      return toPaginatedResponse(items.map(basePlace), page, 20, false);
    }

    const params = new URLSearchParams({ type: 'PLACE', page: String(page), size: '20' });
    if (query.search) params.set('q', query.search);
    if (query.city) params.set('regionCode', query.city);
    if (query.categoryCode) params.set('categoryCode', query.categoryCode);
    const response = await apiGet<DiscoveryPage>(`/discovery/search?${params}`);
    return toPaginatedResponse(
      response.items.map((item) => ({
        ...basePlace({
          id: normalizeDiscoveryId(item.sourceId),
          name: item.title,
          latitude: item.latitude ?? 0,
          longitude: item.longitude ?? 0,
          address: null,
          categoryName: item.categoryCode,
        }),
        description: item.description,
        city: item.city ?? '',
      })),
      response.page,
      response.size,
      response.hasNext,
    );
  },

  getPlace: async (placeId: EntityId): Promise<{ data: Place }> => {
    const place = await apiGet<BackendPlace>(`/places/${placeId}`);
    const photos = place.media.map((media) => media.url);
    return {
      data: {
        ...basePlace(place),
        description: place.description,
        city: place.cityName,
        cover_image_url: photos[0] ?? null,
        photos,
        phone: place.phone ?? undefined,
        website: place.website ?? undefined,
        opening_hours: place.schedules
          .map((schedule) => `${schedule.dayOfWeek}: ${schedule.openTime}-${schedule.closeTime}`)
          .join(', '),
      },
    };
  },

  getPlaceActivities: (placeId: EntityId, page = 0): Promise<BackendActivityPage> =>
    apiGet<BackendActivityPage>('/activities', {
      params: { placeId: String(placeId), page, size: 20 },
    }),

  getActivityAvailability: (activityId: EntityId): Promise<BackendActivity[]> =>
    apiGet<BackendActivity[]>(`/activities/${encodeURIComponent(String(activityId))}/availability`),

  getActivityBooking: (bookingId: EntityId): Promise<BackendBooking> =>
    apiGet<BackendBooking>(`/bookings/${encodeURIComponent(String(bookingId))}`),

  createActivityBooking: ({ slotId, quantity, operator, phoneNumber }: CreateActivityBookingInput): Promise<BackendBooking> =>
    apiPost<BackendBooking>(
      '/bookings',
      {
        slotId: String(slotId),
        quantity,
        ...(operator && phoneNumber ? { operator, phoneNumber } : {}),
      },
      { headers: { 'Idempotency-Key': createIdempotencyKey() } },
    ),
};
