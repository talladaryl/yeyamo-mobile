import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { genericInteractionsApi, type InteractionTarget, type InteractionType } from './generic-interactions.api';

const key = (target: InteractionTarget, id: string, type: InteractionType) => ['generic-interaction', target, id, type] as const;

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
      await genericInteractionsApi.toggle(target, id, type, active);
      return !active;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key(target, id ?? '', type) }),
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
