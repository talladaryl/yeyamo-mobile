import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storyApi } from './story.api';

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: storyApi.getStories,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 5, // 5 min — stories refresh often
  });
}

export function useStoryDetail(storyId: number) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: () => storyApi.getStory(storyId),
    select: (res) => res.data,
  });
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: number) => storyApi.markViewed({ story_id: storyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
