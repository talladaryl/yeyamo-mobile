import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { placesApi } from './places.api';
import type { PlacesQuery } from './types';

export function usePlaces(query: Omit<PlacesQuery, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['places', query],
    queryFn: ({ pageParam }) =>
      placesApi.getPlaces({ ...query, page: pageParam as number | undefined }),
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
    queryFn: () => placesApi.getPlace(placeId),
    select: (res) => res.data,
  });
}
