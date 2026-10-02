import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { MOCK_STORIES } from '@/features/mock/mockData';
import type { EntityId } from '@/types/api.types';
import { storyApi, type CreateStoryPayload } from './story.api';
import type { Story } from './types';
import { traceStoryRuntime } from '@/features/social/social.runtime-trace';

export const STORIES_QUERY_KEY = ['stories'] as const;
type StoriesResponse = { data: Story[] };

function storyCacheKey(isDemo: boolean, viewerId?: string | number) {
  return [...STORIES_QUERY_KEY, isDemo ? 'demo' : 'backend', String(viewerId ?? 'anonymous')] as const;
}

export function useStories() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const viewerId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: storyCacheKey(isDemo, viewerId),
    queryFn: () => isDemo ? Promise.resolve({ data: MOCK_STORIES }) : storyApi.getStories(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5,
    enabled: isHydrated && isAuthenticated,
  });
}

export function useStoryDetail(storyId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const viewerId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['story', isDemo ? 'demo' : 'backend', String(viewerId ?? 'anonymous'), storyId],
    queryFn: () => isDemo
      ? Promise.resolve({ data: MOCK_STORIES.find((story) => String(story.id) === String(storyId)) ?? MOCK_STORIES[0] })
      : storyApi.getStory(storyId),
    select: (res) => res.data,
    enabled: Boolean(storyId) && isHydrated && isAuthenticated,
  });
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (storyId: EntityId) => isDemo ? Promise.resolve() : storyApi.markViewed({ story_id: storyId }),
    onSuccess: (_, storyId) => {
      queryClient.setQueriesData<StoriesResponse>({ queryKey: STORIES_QUERY_KEY }, (response) => response
        ? { data: response.data.map((story) => String(story.id) === String(storyId) ? { ...story, viewed: true } : story) }
        : response,
      );
    },
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const viewerId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (payload: CreateStoryPayload) => isDemo
      ? Promise.resolve({
          data: {
            ...MOCK_STORIES[0],
            id: `demo-story-${Date.now()}`,
            media: { ...MOCK_STORIES[0].media, id: payload.mediaId },
            text: payload.caption,
            caption_style: payload.captionStyle,
            duration_seconds: payload.durationSeconds,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            viewed: false,
          } satisfies Story,
        })
      : storyApi.createStory(payload),
    onSuccess: ({ data: createdStory }) => {
      // `select` affects observers only: React Query still stores { data }.
      // Treating this cache entry as Story[] threw after a successful POST and
      // made the editor wrongly report that publishing had failed.
      const merge = (response: StoriesResponse | undefined): StoriesResponse => {
        const current = response?.data ?? [];
        return {
          data: current.some((story) => String(story.id) === String(createdStory.id))
            ? current
            : [...current, createdStory],
        };
      };
      queryClient.setQueryData<StoriesResponse>(storyCacheKey(isDemo, viewerId), merge);
      queryClient.setQueriesData<StoriesResponse>({ queryKey: STORIES_QUERY_KEY }, merge);
      traceStoryRuntime('STORY_PERSISTENCE_CONFIRMED', {
        flow: 'story', storyId: String(createdStory.id), viewerAuthUserId: String(viewerId ?? 'anonymous'),
        createdAt: createdStory.created_at, expectedExpiresAt: createdStory.expires_at,
      });
      traceStoryRuntime('STORY_CACHE_INVALIDATE', { flow: 'story', storyId: String(createdStory.id) });
      // Creation is confirmed by POST. Reconciliation failure must not turn a
      // successful mutateAsync call into a false publication error.
      void queryClient.invalidateQueries({ queryKey: STORIES_QUERY_KEY, refetchType: 'active' })
        .then(() => traceStoryRuntime('STORY_POST_CREATE_REFETCH', { flow: 'story', storyId: String(createdStory.id) }))
        .catch((error: unknown) => traceStoryRuntime('STORY_POST_CREATE_REFETCH_ERROR', {
          flow: 'story', storyId: String(createdStory.id), errorType: error instanceof Error ? error.name : 'UnknownError',
        }));
    },
  });
}
