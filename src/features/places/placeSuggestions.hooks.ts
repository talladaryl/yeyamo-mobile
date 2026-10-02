import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { placesApi } from './places.api';

export const placeSuggestionKeys = {
  all: ['place-suggestions'] as const,
  mine: (viewerAuthUserId?: string | number | null) =>
    [...placeSuggestionKeys.all, 'mine', String(viewerAuthUserId ?? 'anonymous')] as const,
};

/** The suggestion lifecycle is always read from place-service, never from a local draft. */
export function useMyPlaceSuggestions() {
  const viewerAuthUserId = useAuthStore((state) => state.user?.id);
  return useInfiniteQuery({
    queryKey: placeSuggestionKeys.mine(viewerAuthUserId),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => placesApi.myPlaceSuggestions(pageParam, 20),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
  });
}
