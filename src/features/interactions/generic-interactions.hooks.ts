import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { genericInteractionsApi, type ExplorerFavoriteTarget, type ExplorerFeedbackTarget, type FeedbackType, type InteractionTarget, type InteractionType } from './generic-interactions.api';
import type { SpringPage } from '@/services/api/contracts';
import type { RecommendationPage } from '@/features/recommendations/recommendations.types';

const key = (target: InteractionTarget, id: string, type: InteractionType) => ['generic-interaction', target, id, type] as const;
export const genericInteractionKeys = {
  all: ['generic-interaction'] as const,
  favoriteList: ['generic-interaction', 'favorites'] as const,
  feedback: (target: ExplorerFeedbackTarget, id: string) => ['generic-interaction', 'feedback', target, id] as const,
};

function isExplorerFavoriteTarget(target: InteractionTarget): target is ExplorerFavoriteTarget {
  return target === 'PLACE' || target === 'EVENT' || target === 'ACTIVITY' || target === 'EXPERIENCE' || target === 'CULTURE_CONTENT';
}

export function useInteractionStatus(target: InteractionTarget, id?: string, type: InteractionType = 'FAVORITE') {
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: key(target, id ?? '', type),
    enabled: Boolean(id),
    queryFn: () => demo ? Promise.resolve(null) : genericInteractionsApi.status(target, id!, type),
    select: (interaction) => Boolean(interaction),
  });
}

export function useToggleInteraction(target: InteractionTarget, id?: string, type: InteractionType = 'FAVORITE') {
  const client = useQueryClient();
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: async (active: boolean) => {
      if (!id || demo) return !active;
      if (type === 'FAVORITE' && isExplorerFavoriteTarget(target)) {
        if (active) await genericInteractionsApi.removeFavorite(target, id);
        else await genericInteractionsApi.favorite(target, id);
        return !active;
      }
      await genericInteractionsApi.toggle(target, id, type, active);
      return !active;
    },
    onMutate: async (active) => {
      const statusKey = key(target, id ?? '', type);
      await client.cancelQueries({ queryKey: statusKey });
      const previous = client.getQueryData<boolean>(statusKey);
      client.setQueryData(statusKey, !active);
      return { previous, statusKey };
    },
    onError: (_error, _active, context) => {
      if (context) client.setQueryData(context.statusKey, context.previous);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key(target, id ?? '', type) });
      if (type === 'FAVORITE' && isExplorerFavoriteTarget(target)) client.invalidateQueries({ queryKey: genericInteractionKeys.favoriteList });
    },
  });
}

/** Explorer feedback is exclusive server-side. NOT_INTERESTED removes only the
 * matching recommendation optimistically and restores the exact cache snapshot
 * on any error. There is no persisted client-side exclusion list. */
export function useExplorerFeedback() {
  const client = useQueryClient();
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: ({ targetType, targetId, feedbackType }: { targetType: ExplorerFeedbackTarget; targetId: string; feedbackType: FeedbackType }) =>
      demo ? Promise.resolve(null) : genericInteractionsApi.feedback(targetType, targetId, feedbackType),
    onMutate: async (variables) => {
      await client.cancelQueries({ queryKey: ['recommendations'] });
      const recommendations = client.getQueriesData<RecommendationPage>({ queryKey: ['recommendations'] });
      const feedbackKey = genericInteractionKeys.feedback(variables.targetType, variables.targetId);
      const previousFeedback = client.getQueryData<FeedbackType>(feedbackKey);
      if (variables.feedbackType === 'NOT_INTERESTED') {
        client.setQueriesData<RecommendationPage>({ queryKey: ['recommendations'] }, (current) => current
          ? { ...current, items: current.items.filter((item) => item.targetId !== variables.targetId) }
          : current);
      } else {
        client.setQueriesData<RecommendationPage>({ queryKey: ['recommendations'] }, (current) => current
          ? { ...current, items: current.items.map((item) => item.targetId === variables.targetId ? { ...item, viewerState: { feedbackType: variables.feedbackType } } : item) }
          : current);
      }
      client.setQueryData(feedbackKey, variables.feedbackType);
      return { recommendations, feedbackKey, previousFeedback };
    },
    onError: (_error, _variables, context) => {
      context?.recommendations.forEach(([queryKey, value]) => client.setQueryData(queryKey, value));
      if (!context) return;
      if (context.previousFeedback === undefined) client.removeQueries({ queryKey: context.feedbackKey });
      else client.setQueryData(context.feedbackKey, context.previousFeedback);
    },
    onSuccess: (_result, variables) => {
      client.invalidateQueries({ queryKey: ['recommendations'] });
      client.invalidateQueries({ queryKey: genericInteractionKeys.feedback(variables.targetType, variables.targetId) });
    },
  });
}

/** Undo removes the persisted feedback first; recommendations are then read again
 * from the backend rather than being fabricated from a local hidden-id array. */
export function useRemoveExplorerFeedback() {
  const client = useQueryClient();
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: ExplorerFeedbackTarget; targetId: string }) =>
      demo ? Promise.resolve() : genericInteractionsApi.removeFeedback(targetType, targetId),
    onSuccess: (_result, variables) => {
      client.removeQueries({ queryKey: genericInteractionKeys.feedback(variables.targetType, variables.targetId) });
      client.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useExplorerFavorites() {
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useInfiniteQuery({
    queryKey: genericInteractionKeys.favoriteList,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => demo ? Promise.resolve({ content: [], number: pageParam, size: 20, totalElements: 0, totalPages: 0, first: true, last: true } satisfies SpringPage<import('./generic-interactions.api').GenericInteraction>) : genericInteractionsApi.favorites(pageParam),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
  });
}

export function useInteractionComments(target: InteractionTarget, id?: string) {
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['generic-interaction', target, id ?? '', 'comments'],
    enabled: Boolean(id),
    queryFn: () => demo ? Promise.resolve([]) : genericInteractionsApi.comments(target, id!),
  });
}

export function useCreateInteractionComment(target: InteractionTarget, id?: string) {
  const client = useQueryClient();
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (body: string) => {
      if (!id || demo) return Promise.resolve(null);
      return genericInteractionsApi.comment(target, id, body);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['generic-interaction', target, id ?? '', 'comments'] }),
  });
}
