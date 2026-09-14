import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { MOCK_FEED_PAGE } from '@/features/mock/mockData';
import { feedApi } from './feed.api';
import { feedService } from './feed.service';
import type { FeedPost } from './types';
import type { PaginatedResponse , EntityId } from '@/types/api.types';
import { useInterestsStore } from '@/features/interests/interests.store';
import { mockSponsoredFeedItems } from './sponsoredMockData';
import { sponsoredFeedApi } from './sponsored-feed.api';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const FEED_QUERY_KEY = ['feed'] as const;

export function useFeed(enabled = true) {
  const { sessionMode, isAuthenticated, isHydrated } = useAuthStore();
  const isDemo = sessionMode?.startsWith('demo-') ?? false;
  const selectedInterestIds = useInterestsStore((state) => state.selectedInterestIds);
  const canLoad = enabled && isHydrated && isAuthenticated;

  return useInfiniteQuery({
    // The backend currently accepts only page and size. Interest/region values
    // remain limited to explicitly selected demo sessions and are not presented
    // as production personalization.
    queryKey: [...FEED_QUERY_KEY, isDemo ? 'demo' : 'backend', ...(isDemo ? [selectedInterestIds.join(',')] : [])],
    queryFn: ({ pageParam }) =>
      isDemo
        ? Promise.resolve(personalizeMockFeed(selectedInterestIds))
        : feedApi.getFeed(pageParam),
    initialPageParam: 0,
    enabled: canLoad,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) => {
      if (lastPage.links.next) {
        const next = Number(lastPage.links.next);
        if (Number.isInteger(next) && next > lastPage.meta.current_page) return next;
      }
      return lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined;
    },
  });
}

export function useSponsoredFeed(regionId?: number) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['feed', 'sponsored', regionId ?? 'all', isDemo ? 'demo' : 'backend'],
    enabled: FEATURE_FLAGS.ads_delivery_enabled,
    queryFn: () => isDemo ? Promise.resolve(mockSponsoredFeedItems) : sponsoredFeedApi.deliveries(regionId),
  });
}

const MOCK_POST_INTERESTS: Record<string, string[]> = {
  101: ['voyage', 'nature', 'photographie', 'sorties'],
  102: ['gastronomie', 'sorties', 'photographie'],
  103: ['culture', 'art', 'mode', 'histoire'],
  104: ['culture', 'histoire', 'langues'],
  105: ['gastronomie', 'culture'],
  106: ['culture', 'art', 'histoire'],
  107: ['culture', 'langues', 'education'],
};

function personalizeMockFeed(selectedInterestIds: string[]): PaginatedResponse<FeedPost> {
  const score = (post: FeedPost) =>
    (MOCK_POST_INTERESTS[String(post.id)] ?? []).filter((interest) => selectedInterestIds.includes(interest)).length;

  return {
    ...MOCK_FEED_PAGE,
    data: [...MOCK_FEED_PAGE.data].sort((left, right) => score(right) - score(left)),
    meta: { ...MOCK_FEED_PAGE.meta, total: MOCK_FEED_PAGE.data.length },
  };
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: EntityId; isLiked: boolean }) =>
      isDemo ? Promise.resolve() : feedService.toggleLike(postId, isLiked),

    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previous = queryClient.getQueriesData<InfiniteData<PaginatedResponse<FeedPost>>>({ queryKey: FEED_QUERY_KEY });

      queryClient.setQueriesData<InfiniteData<PaginatedResponse<FeedPost>>>(
        { queryKey: FEED_QUERY_KEY },
        (old) => {
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
      context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
  });
}
