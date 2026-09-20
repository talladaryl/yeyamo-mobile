import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { placesApi } from './places.api';
import { mockPlaces } from './mockData';
import type { PlacesQuery } from './types';
import type { EntityId } from '@/types/api.types';

export function usePlaces(query: Omit<PlacesQuery, 'page'>) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useInfiniteQuery({
    queryKey: ['places', isDemo ? 'demo' : 'backend', query],
    queryFn: ({ pageParam }) =>
      isDemo
        ? Promise.resolve({
            data: mockPlaces,
            meta: {
              current_page: 1,
              last_page: 1,
              per_page: mockPlaces.length,
              total: mockPlaces.length,
            },
            links: {
              first: null,
              last: null,
              prev: null,
              next: null,
            },
          })
        : placesApi.getPlaces({ ...query, page: pageParam as number | undefined }),
    initialPageParam: undefined as number | undefined,
    enabled: isDemo || (query.lat != null && query.lng != null) || Boolean(query.search || query.city || query.categoryCode),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function usePlaceDetail(placeId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['place', isDemo ? 'demo' : 'backend', placeId],
    enabled: Boolean(placeId),
    queryFn: () =>
      isDemo
        ? Promise.resolve({ data: mockPlaces.find((place) => String(place.id) === String(placeId)) ?? mockPlaces[0] })
        : placesApi.getPlace(placeId),
    select: (res) => res.data,
  });
}
