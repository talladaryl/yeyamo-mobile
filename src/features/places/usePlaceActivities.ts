import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import type { EntityId } from '@/types/api.types';
import { placesApi } from './places.api';
import type { BackendActivity, BackendActivityPage, BackendBooking, CreateActivityBookingInput } from './types';

function useIsDemoSession() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

function demoAvailability(activityId: EntityId): BackendActivity[] {
  const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  return [{
    id: `demo-slot-${activityId}`,
    activityId: String(activityId),
    placeId: null,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    capacity: 12,
    reserved: 2,
    available: 10,
    unitPrice: 5000,
    isPaid: true,
    amount: 5000,
    currency: 'XAF',
    countryCode: 'CM',
    status: 'OPEN',
  }];
}

function demoBooking(input: CreateActivityBookingInput): BackendBooking {
  return {
    id: `demo-booking-${String(input.slotId)}`,
    reference: 'DEMO-ACTIVITY-BOOKING',
    activityId: String(input.slotId),
    slotId: String(input.slotId),
    quantity: input.quantity,
    unitPrice: 5000,
    totalAmount: input.quantity * 5000,
    currency: 'XAF',
    status: 'CONFIRMED',
    paymentStatus: 'NOT_REQUIRED',
    createdAt: new Date().toISOString(),
  };
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
    queryFn: () => isDemo ? Promise.resolve(demoAvailability(activityId!)) : placesApi.getActivityAvailability(activityId!),
    enabled: Boolean(activityId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateActivityBooking() {
  const isDemo = useIsDemoSession();
  return useMutation({
    mutationFn: (input: CreateActivityBookingInput) => isDemo
      ? Promise.resolve(demoBooking(input))
      : placesApi.createActivityBooking(input),
  });
}

export function useActivityBookingStatus(bookingId: EntityId | undefined, shouldPoll: boolean) {
  const isDemo = useIsDemoSession();
  return useQuery<BackendBooking>({
    queryKey: ['activity-booking', isDemo ? 'demo' : 'backend', bookingId],
    queryFn: () => isDemo
      ? Promise.resolve(demoBooking({ slotId: bookingId!, quantity: 1 }))
      : placesApi.getActivityBooking(bookingId!),
    enabled: Boolean(bookingId) && shouldPoll,
    refetchInterval: isDemo ? false : 5_000,
    staleTime: 0,
  });
}
