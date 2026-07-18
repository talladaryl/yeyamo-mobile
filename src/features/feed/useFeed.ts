import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ENV from '@/config/env';
import { MOCK_FEED_PAGE } from '@/features/mock/mockData';
import { feedApi } from './feed.api';
import { feedService } from './feed.service';
import type { FeedPost } from './types';
import type { PaginatedResponse } from '@/types/api.types';
import { useInterestsStore } from '@/features/interests/interests.store';

export const FEED_QUERY_KEY = ['feed'] as const;

export function useFeed() {
  const selectedInterestIds = useInterestsStore((state) => state.selectedInterestIds);

  return useInfiniteQuery({
    queryKey: [...FEED_QUERY_KEY, selectedInterestIds.join(',')],
    queryFn: ({ pageParam }) =>
      ENV.USE_MOCKS
        ? Promise.resolve(personalizeMockFeed(selectedInterestIds))
        : feedApi.getFeed(pageParam as string | undefined, selectedInterestIds),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.links.next ? lastPage.meta.current_page.toString() : undefined,
  });
}

const MOCK_POST_INTERESTS: Record<number, string[]> = {
  101: ['voyage', 'nature', 'photographie', 'sorties'],
  102: ['gastronomie', 'sorties', 'photographie'],
  103: ['culture', 'art', 'mode', 'histoire'],
};

function personalizeMockFeed(selectedInterestIds: string[]): PaginatedResponse<FeedPost> {
  if (!selectedInterestIds.length) return MOCK_FEED_PAGE;

  const score = (post: FeedPost) =>
    (MOCK_POST_INTERESTS[post.id] ?? []).filter((interest) => selectedInterestIds.includes(interest)).length;

  return {
    ...MOCK_FEED_PAGE,
    data: [...MOCK_FEED_PAGE.data].sort((left, right) => score(right) - score(left)),
  };
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: number; isLiked: boolean }) =>
      ENV.USE_MOCKS ? Promise.resolve() : feedService.toggleLike(postId, isLiked),

    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueryData(FEED_QUERY_KEY);

      queryClient.setQueryData(
        FEED_QUERY_KEY,
        (old: { pages: PaginatedResponse<FeedPost>[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      is_liked: !isLiked,
                      likes_count: post.likes_count + (isLiked ? -1 : 1),
                    }
                  : post,
              ),
            })),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previous);
      }
    },
  });
}
