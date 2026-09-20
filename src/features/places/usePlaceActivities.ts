import { useMutation, useQuery } from '@tanstack/react-query';
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
  return useMutation({ mutationFn: (input: CreateActivityBookingInput) => placesApi.createActivityBooking(input) });
}

export function useActivityBookingStatus(bookingId: EntityId | undefined, shouldPoll: boolean) {
  return useQuery<BackendBooking>({
    queryKey: ['activity-booking', 'backend', bookingId],
    queryFn: () => placesApi.getActivityBooking(bookingId!),
    enabled: Boolean(bookingId) && shouldPoll,
    refetchInterval: 5_000,
    staleTime: 0,
  });
}
