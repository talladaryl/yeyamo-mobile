import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import ENV from '@/config/env';
import { placesApi } from './places.api';
import { mockPlaces } from './mockData';
import type { PlacesQuery } from './types';

export function usePlaces(query: Omit<PlacesQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['places', query],
    queryFn: ({ pageParam }) =>
      ENV.USE_MOCKS
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
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
}

export function usePlaceDetail(placeId: number) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve({ data: mockPlaces.find((place) => place.id === placeId) ?? mockPlaces[0] })
        : placesApi.getPlace(placeId),
    select: (res) => res.data,
  });
}
