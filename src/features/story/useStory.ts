import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ENV from '@/config/env';
import { MOCK_STORIES } from '@/features/mock/mockData';
import { storyApi } from './story.api';

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve({ data: MOCK_STORIES })
        : storyApi.getStories(),
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5, // 5 min — stories refresh often
  });
}

export function useStoryDetail(storyId: number) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve({
            data: MOCK_STORIES.find((story) => story.id === storyId) ?? MOCK_STORIES[0],
          })
        : storyApi.getStory(storyId),
    select: (res) => res.data,
  });
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: number) =>
      ENV.USE_MOCKS ? Promise.resolve() : storyApi.markViewed({ story_id: storyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
