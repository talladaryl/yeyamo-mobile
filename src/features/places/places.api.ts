import { apiGet } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { Place, PlacesQuery } from './types';

export const placesApi = {
  getPlaces: (query: PlacesQuery) => {
    const params = new URLSearchParams();
    if (query.city) params.set('city', query.city);
    if (query.search) params.set('search', query.search);
    if (query.lat) params.set('lat', String(query.lat));
    if (query.lng) params.set('lng', String(query.lng));
    if (query.radius_km) params.set('radius_km', String(query.radius_km));
    if (query.page) params.set('page', String(query.page));

    return apiGet<PaginatedResponse<Place>>(`/places?${params.toString()}`);
  },

  getPlace: (placeId: number) =>
    apiGet<{ data: Place }>(`/places/${placeId}`),
};
