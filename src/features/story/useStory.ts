import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { MOCK_STORIES } from '@/features/mock/mockData';
import type { EntityId } from '@/types/api.types';
import { storyApi, type CreateStoryPayload } from './story.api';
import type { Story } from './types';

export const STORIES_QUERY_KEY = ['stories'] as const;

function storyCacheKey(isDemo: boolean) {
  return [...STORIES_QUERY_KEY, isDemo ? 'demo' : 'backend'] as const;
}

export function useStories() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: storyCacheKey(isDemo),
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

  return useQuery({
    queryKey: ['story', isDemo ? 'demo' : 'backend', storyId],
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
      queryClient.setQueriesData<Story[]>({ queryKey: STORIES_QUERY_KEY }, (stories) =>
        stories?.map((story) => String(story.id) === String(storyId) ? { ...story, viewed: true } : story),
      );
    },
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (payload: CreateStoryPayload) => isDemo
      ? Promise.resolve({
          data: {
            ...MOCK_STORIES[0],
            id: `demo-story-${Date.now()}`,
            media: { ...MOCK_STORIES[0].media, id: payload.mediaId },
            text: payload.caption,
            duration_seconds: payload.durationSeconds,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            viewed: false,
          } satisfies Story,
        })
      : storyApi.createStory(payload),
    onSuccess: ({ data: createdStory }) => {
      queryClient.setQueryData<Story[]>(storyCacheKey(isDemo), (stories) => {
        const current = stories ?? [];
        return current.some((story) => String(story.id) === String(createdStory.id))
          ? current
          : [...current, createdStory];
      });
      queryClient.setQueriesData<Story[]>({ queryKey: STORIES_QUERY_KEY }, (stories) => {
        const current = stories ?? [];
        return current.some((story) => String(story.id) === String(createdStory.id))
          ? current
          : [...current, createdStory];
      });
    },
  });
}
