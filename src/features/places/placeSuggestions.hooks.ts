import { useInfiniteQuery } from '@tanstack/react-query';
import { placesApi } from './places.api';

export const placeSuggestionKeys = {
  all: ['place-suggestions'] as const,
  mine: () => [...placeSuggestionKeys.all, 'mine'] as const,
};

/** The suggestion lifecycle is always read from place-service, never from a local draft. */
export function useMyPlaceSuggestions() {
  return useInfiniteQuery({
    queryKey: placeSuggestionKeys.mine(),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => placesApi.myPlaceSuggestions(pageParam, 20),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
  });
}
