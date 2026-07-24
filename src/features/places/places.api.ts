import { apiGet } from '@/services/api/client';
import { toPaginatedResponse } from '@/services/api/contracts';
import type { EntityId, PaginatedResponse } from '@/types/api.types';
import type { Place, PlacesQuery } from './types';

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
    city: '',
    address: item.address ?? '',
    lat: item.latitude,
    lng: item.longitude,
    cover_image_url: null,
    category: item.categoryName ?? 'Autre',
    rating: null,
    reviews_count: 0,
    events_count: 0,
    posts_count: 0,
    is_saved: false,
  };
}

export const placesApi = {
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
    const response = await apiGet<DiscoveryPage>(`/discovery/search?${params}`);
    return toPaginatedResponse(
      response.items.map((item) => ({
        ...basePlace({
          id: item.sourceId,
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
};
