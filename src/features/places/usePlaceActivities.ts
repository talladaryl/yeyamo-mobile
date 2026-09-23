import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EntityId } from '@/types/api.types';
import { placesApi } from './places.api';
import type { BackendActivity, BackendActivityPage, BackendBooking, CreateActivityBookingInput } from './types';

/** All booking data is sourced from booking-service, including local development. */
export function usePlaceActivities(placeId: EntityId | undefined) {
  return useQuery<BackendActivityPage>({
    queryKey: ['place-activities', 'backend', placeId],
    queryFn: () => placesApi.getPlaceActivities(placeId!),
    enabled: Boolean(placeId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useActivityAvailability(activityId: EntityId | undefined) {
  return useQuery<BackendActivity[]>({
    queryKey: ['activity-availability', 'backend', activityId],
    queryFn: () => placesApi.getActivityAvailability(activityId!),
    enabled: Boolean(activityId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateActivityBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityBookingInput) => placesApi.createActivityBooking(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activity-availability'] });
      void queryClient.invalidateQueries({ queryKey: ['place-activities'] });
      void queryClient.invalidateQueries({ queryKey: ['reservations', 'backend'] });
    },
  });
}

export function useActivityBookingStatus(bookingId: EntityId | undefined, shouldPoll: boolean) {
  return useQuery<BackendBooking>({
    queryKey: ['activity-booking', 'backend', bookingId],
    queryFn: () => placesApi.getActivityBooking(bookingId!),
    enabled: Boolean(bookingId) && shouldPoll,
    refetchInterval: (query) => {
      const booking = query.state.data;
      return booking && ['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(booking.status) ? false : 5_000;
    },
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}
