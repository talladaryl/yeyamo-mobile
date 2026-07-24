import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { MOCK_STORIES } from '@/features/mock/mockData';
import { storyApi } from './story.api';
import type { EntityId } from '@/types/api.types';

export function useStories() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['stories', isDemo ? 'demo' : 'backend'],
    queryFn: () =>
      isDemo
        ? Promise.resolve({ data: MOCK_STORIES })
        : storyApi.getStories(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5, // 5 min — stories refresh often
  });
}

export function useStoryDetail(storyId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['story', isDemo ? 'demo' : 'backend', storyId],
    queryFn: () =>
      isDemo
        ? Promise.resolve({
            data: MOCK_STORIES.find((story) => String(story.id) === String(storyId)) ?? MOCK_STORIES[0],
          })
        : storyApi.getStory(storyId),
    select: (res) => res.data,
  });
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (storyId: EntityId) =>
      isDemo ? Promise.resolve() : storyApi.markViewed({ story_id: storyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
