import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { MOCK_FEED_PAGE } from '@/features/mock/mockData';
import { feedApi } from './feed.api';
import { feedService } from './feed.service';
import type { FeedPost } from './types';
import type { PaginatedResponse } from '@/types/api.types';
import type { EntityId } from '@/types/api.types';
import { useInterestsStore } from '@/features/interests/interests.store';
import { mockSponsoredFeedItems } from './sponsoredMockData';
import { sponsoredFeedApi } from './sponsored-feed.api';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const FEED_QUERY_KEY = ['feed'] as const;

export function useFeed(regionId?: number, enabled = true) {
  const selectedInterestIds = useInterestsStore((state) => state.selectedInterestIds);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useInfiniteQuery({
    queryKey: [...FEED_QUERY_KEY, isDemo ? 'demo' : 'backend', selectedInterestIds.join(','), regionId ?? 'all'],
    queryFn: ({ pageParam }) =>
      isDemo
        ? Promise.resolve(personalizeMockFeed(selectedInterestIds, regionId))
        : feedApi.getFeed(pageParam as string | undefined, selectedInterestIds, regionId),
    initialPageParam: undefined as string | undefined,
    enabled,
    getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
      lastPage.links.next ? lastPage.meta.current_page.toString() : undefined,
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

function personalizeMockFeed(selectedInterestIds: string[], regionId?: number): PaginatedResponse<FeedPost> {
  const regionalPosts = regionId
    ? MOCK_FEED_PAGE.data.filter((post) => post.place_tag?.region_id === regionId)
    : MOCK_FEED_PAGE.data;

  const score = (post: FeedPost) =>
    (MOCK_POST_INTERESTS[String(post.id)] ?? []).filter((interest) => selectedInterestIds.includes(interest)).length;

  return {
    ...MOCK_FEED_PAGE,
    data: [...regionalPosts].sort((left, right) => score(right) - score(left)),
    meta: { ...MOCK_FEED_PAGE.meta, total: regionalPosts.length },
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
