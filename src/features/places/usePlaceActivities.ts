import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import type { EntityId } from '@/types/api.types';
import { placesApi } from './places.api';
import type { BackendActivityPage } from './types';

function useIsDemoSession() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function usePlaceActivities(placeId: EntityId | undefined) {
  const isDemo = useIsDemoSession();
  return useQuery<BackendActivityPage>({
    queryKey: ['place-activities', isDemo ? 'demo' : 'backend', placeId],
    queryFn: () => placesApi.getPlaceActivities(placeId!),
    enabled: Boolean(placeId) && !isDemo,
    staleTime: 2 * 60 * 1000,
  });
}

export function useActivityAvailability(activityId: EntityId | undefined) {
  const isDemo = useIsDemoSession();
  return useQuery({
    queryKey: ['activity-availability', isDemo ? 'demo' : 'backend', activityId],
    queryFn: () => placesApi.getActivityAvailability(activityId!),
    enabled: Boolean(activityId) && !isDemo,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateActivityBooking() {
  const isDemo = useIsDemoSession();
  return useMutation({
    mutationFn: ({ slotId, quantity }: { slotId: EntityId; quantity: number }) => {
      if (isDemo) return Promise.reject(new Error('ACTIVITY_BOOKING_UNAVAILABLE_IN_DEMO'));
      return placesApi.createActivityBooking(slotId, quantity);
    },
  });
}
