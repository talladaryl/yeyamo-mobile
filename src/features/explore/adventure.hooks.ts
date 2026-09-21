import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adventureApi } from './adventure.api';
import type { AdventurePlanDetail, AdventurePlanRequest, AdventureSkipResponse } from './adventure.types';

export const adventureKeys = {
  all: ['adventure-plans'] as const,
  list: () => [...adventureKeys.all, 'list'] as const,
  detail: (planId: string | undefined) => [...adventureKeys.all, 'detail', planId] as const,
  preview: (request: AdventurePlanRequest) => [...adventureKeys.all, 'preview', request] as const,
};

export function useAdventurePlan(planId: string | undefined) {
  return useQuery({
    queryKey: adventureKeys.detail(planId),
    enabled: Boolean(planId),
    queryFn: () => adventureApi.getAdventurePlan(planId!),
  });
}

export function useAdventurePlans() {
  return useInfiniteQuery({
    queryKey: adventureKeys.list(),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => adventureApi.getAdventurePlans(pageParam),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
  });
}

export function usePreviewAdventurePlan() {
  return useMutation({ mutationFn: (request: AdventurePlanRequest) => adventureApi.previewAdventurePlan(request) });
}

export function useCreateAdventurePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AdventurePlanRequest) => adventureApi.createAdventurePlan(request),
    onSuccess: (plan) => {
      queryClient.setQueryData(adventureKeys.detail(plan.id), plan);
      queryClient.invalidateQueries({ queryKey: adventureKeys.all });
    },
  });
}

export function useDeleteAdventurePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => adventureApi.deleteAdventurePlan(planId),
    onSuccess: (_result, planId) => {
      queryClient.removeQueries({ queryKey: adventureKeys.detail(planId) });
      queryClient.invalidateQueries({ queryKey: adventureKeys.all });
    },
  });
}

export function useSkipAdventureRecommendation(planId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recommendationId: string) => adventureApi.skipAdventureRecommendation(planId!, recommendationId),
    onSuccess: (result: AdventureSkipResponse) => {
      if (!planId) return;
      queryClient.setQueryData<AdventurePlanDetail>(adventureKeys.detail(planId), (current) => {
        if (!current) return current;
        return {
          ...current,
          updatedAt: new Date().toISOString(),
          days: current.days.map((day) => {
            const containsSkippedRecommendation = day.items.some((item) => item.recommendationId === result.skippedRecommendationId);
            const retained = day.items.filter((item) => item.recommendationId !== result.skippedRecommendationId);
            return containsSkippedRecommendation && result.replacement
              ? { ...day, items: [...retained, result.replacement] }
              : { ...day, items: retained };
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: adventureKeys.list() });
    },
  });
}
