import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import type { EntityId } from '@/types/api.types';
import { mockEvents } from './mockData';
import { eventsApi } from './events.api';

export function useUpcomingEvents() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['events', isDemo ? 'demo' : 'backend', 'upcoming'],
    queryFn: () => isDemo ? Promise.resolve(mockEvents) : eventsApi.upcoming(),
  });
}

export function useEventDetail(eventId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['events', isDemo ? 'demo' : 'backend', eventId],
    enabled: Boolean(eventId),
    queryFn: () => isDemo
      ? Promise.resolve(mockEvents.find((event) => String(event.id) === String(eventId)) ?? mockEvents[0])
      : eventsApi.detail(eventId),
  });
}

export function useEventRegistration(eventId: EntityId) {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: async (registered: boolean) => {
      if (isDemo) return;
      if (registered) await eventsApi.unregister(eventId);
      else await eventsApi.register(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
