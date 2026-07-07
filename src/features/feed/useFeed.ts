import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ENV from '@/config/env';
import { MOCK_FEED_PAGE } from '@/features/mock/mockData';
import { feedApi } from './feed.api';
import { feedService } from './feed.service';
import type { FeedPost } from './types';
import type { PaginatedResponse } from '@/types/api.types';

export const FEED_QUERY_KEY = ['feed'] as const;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      ENV.USE_MOCKS ? Promise.resolve(MOCK_FEED_PAGE) : feedApi.getFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.links.next ? lastPage.meta.current_page.toString() : undefined,
  });
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
