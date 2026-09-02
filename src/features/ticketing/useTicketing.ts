import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { usePartnerProfile } from '@/features/partner-dashboard/usePartnerDashboard';
import {
  type CreatePartnerTicketTypePayload,
  type StaffScanPayload,
  type TicketAnalyticsFilters,
  type TicketPageFilters,
  ticketingApi,
} from './ticketing.api';
import type {
  CreateTicketOrderInput,
  CreateTicketTypeInput,
  OwnedTicket,
  OwnedTicketStatus,
  PublicEventTickets,
  TicketAnalyticsMetric,
  TicketOrderResponse,
  TicketSummary,
  TicketDetailResponse,
  TicketingDashboard,
  TicketTypeResponse,
} from './types';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const ticketingKeys = {
  all: ['ticketing'] as const,
  eventTypes: (eventId: string) => [...ticketingKeys.all, 'events', eventId, 'types'] as const,
  eventOrders: (eventId: string, filters: TicketPageFilters = {}) =>
    [...ticketingKeys.all, 'events', eventId, 'orders', filters] as const,
  eventAnalytics: (eventId: string, filters: Partial<TicketAnalyticsFilters> = {}) =>
    [...ticketingKeys.all, 'events', eventId, 'analytics', filters] as const,
  myTickets: (filters: TicketPageFilters = {}) =>
    [...ticketingKeys.all, 'mine', filters] as const,
  ticket: (ticketId: string) => [...ticketingKeys.all, 'tickets', ticketId] as const,
  order: (orderId: string) => [...ticketingKeys.all, 'orders', orderId] as const,
  qr: (ticketId: string) => [...ticketingKeys.ticket(ticketId), 'qr'] as const,
  scanHistory: (eventId: string, filters: TicketPageFilters = {}) =>
    [...ticketingKeys.all, 'events', eventId, 'scans', filters] as const,
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const defaultRange = () => {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return { from: isoDate(from), to: isoDate(to) };
};

export interface TicketingAnalyticsSummary {
  ticketsSold: number;
  grossRevenue: number;
  checkedIn: number;
  attendanceRate: number;
  rows: TicketAnalyticsMetric[];
}

export function useEventTicketTypes(eventId: string) {
  const profile = usePartnerProfile();
  return useQuery<TicketTypeResponse[]>({
    queryKey: ticketingKeys.eventTypes(eventId),
    queryFn: () => ticketingApi.getEventTicketTypes(eventId, profile.data!.id),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(eventId && profile.data?.id),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
export function useEventTicketing(eventId: string) {
  return useQuery<TicketingDashboard>({
    queryKey: [...ticketingKeys.eventTypes(eventId), 'legacy-dashboard'],
    queryFn: () => ticketingApi.dashboard(eventId),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(eventId),
  });
}

export function useCreateTicketType(eventId: string) {
  const client = useQueryClient();
  const profile = usePartnerProfile();
  return useMutation({
    mutationFn: (payload: Omit<CreatePartnerTicketTypePayload, 'partnerId'>) => {
      if (!FEATURE_FLAGS.ticketing_enabled) throw { code: 'FEATURE_DISABLED', message: 'La billetterie est désactivée.' };
      if (!profile.data?.id) throw new Error('Profil partenaire indisponible');
      return ticketingApi.createTicketType(eventId, { ...payload, partnerId: profile.data.id });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ticketingKeys.eventTypes(eventId) });
      void client.invalidateQueries({
        queryKey: [...ticketingKeys.all, 'events', eventId, 'analytics'],
      });
    },
  });
}

/** Compatibility name retained for the existing creation screen. */
export function useCreateTicket(eventId: string) {
  const mutation = useCreateTicketType(eventId);
  return {
    ...mutation,
    mutate: (input: CreateTicketTypeInput, options?: Parameters<typeof mutation.mutate>[1]) =>
      mutation.mutate(input as unknown as CreatePartnerTicketTypePayload, options),
    mutateAsync: (input: CreateTicketTypeInput, options?: Parameters<typeof mutation.mutateAsync>[1]) =>
      mutation.mutateAsync(input as unknown as CreatePartnerTicketTypePayload, options),
  };
}

export function useTicketOrders(eventId: string, filters: TicketPageFilters = {}) {
  return useQuery({
    queryKey: ticketingKeys.eventOrders(eventId, filters),
    queryFn: () => ticketingApi.getEventTicketOrders(eventId, filters),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(eventId),
    placeholderData: keepPreviousData,
  });
}

export function useTicketAnalytics(
  eventId: string,
  filters: Partial<TicketAnalyticsFilters> = {},
) {
  const profile = usePartnerProfile();
  const range = filters.from && filters.to
    ? { from: filters.from, to: filters.to }
    : defaultRange();
  const partnerId = filters.partnerId ?? profile.data?.id;
  return useQuery({
    queryKey: ticketingKeys.eventAnalytics(eventId, { ...filters, ...range, partnerId }),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(eventId && partnerId),
    queryFn: async (): Promise<TicketingAnalyticsSummary> => {
      const page = await ticketingApi.getTicketingAnalytics(eventId, {
        partnerId: partnerId!,
        ...range,
        timezone: filters.timezone,
        page: filters.page,
        size: filters.size,
      });
      const totals = page.content.filter((row) => row.dimensionType === 'TOTAL');
      const latest = [...totals].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
      return {
        ticketsSold: totals.reduce((sum, row) => sum + row.ticketsSold, 0),
        grossRevenue: totals.reduce((sum, row) => sum + row.revenue, 0),
        checkedIn: totals.reduce((sum, row) => sum + row.scans, 0),
        // Do not recalculate this server-provided rate.
        attendanceRate: latest?.attendanceRate ?? 0,
        rows: page.content,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAvailableTicketTypes(eventId: string) {
  return useQuery<PublicEventTickets>({
    queryKey: [...ticketingKeys.eventTypes(eventId), 'available'],
    queryFn: () => ticketingApi.getAvailableTicketTypes(eventId),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(eventId),
  });
}
export const useEventTickets = useAvailableTicketTypes;

export function useCreateTicketOrder(eventId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketOrderInput) => FEATURE_FLAGS.ticketing_enabled
      ? ticketingApi.createTicketOrder(eventId, payload) : Promise.reject({ code: 'FEATURE_DISABLED', message: 'La billetterie est désactivée.' }),
    onSuccess: (order: TicketOrderResponse) => {
      if (order.status === 'PAID' || order.status === 'ISSUED') {
        void client.invalidateQueries({ queryKey: [...ticketingKeys.all, 'mine'] });
      }
    },
  });
}

export function useTicketOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ticketingKeys.order(orderId),
    queryFn: () => ticketingApi.getTicketOrder(orderId),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(orderId),
    refetchInterval: (query) => {
      const order = query.state.data;
      return order && ['PAID', 'ISSUED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(order.status)
        ? false
        : 2_000;
    },
    staleTime: 0,
  });
}

export function useMyTickets(status: OwnedTicketStatus): UseQueryResult<OwnedTicket[]>;
export function useMyTickets(filters?: TicketPageFilters): UseQueryResult<TicketSummary[]>;
export function useMyTickets(filters: TicketPageFilters | OwnedTicketStatus = {}) {
  const legacy = typeof filters === 'string';
  const queryFilters = legacy ? { status: filters } : filters;
  return useQuery<TicketSummary[] | OwnedTicket[]>({
    queryKey: ticketingKeys.myTickets(queryFilters),
    queryFn: async () => {
      if (legacy) {
        const tickets = await ticketingApi.myTickets();
        return tickets.filter((ticket) => ticket.status === filters);
      }
      const tickets = await ticketingApi.getMyTickets(filters);
      return filters.status
        ? tickets.filter((ticket) => ticket.status === filters.status)
        : tickets;
    },
    placeholderData: keepPreviousData,
    enabled: FEATURE_FLAGS.ticketing_enabled,
  });
}

export function useTicket(ticketId: string) {
  return useQuery<TicketDetailResponse>({
    queryKey: ticketingKeys.ticket(ticketId),
    queryFn: () => ticketingApi.getTicket(ticketId),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(ticketId),
  });
}

export function useTicketQrCredential(ticketId: string) {
  return useQuery({
    queryKey: ticketingKeys.qr(ticketId),
    queryFn: () => ticketingApi.getTicketQrCredential(ticketId),
    enabled: FEATURE_FLAGS.ticketing_enabled && Boolean(ticketId),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useScanTicket(_eventId?: string) {
  return useMutation({
    mutationFn: (payload: StaffScanPayload) => FEATURE_FLAGS.ticketing_enabled && FEATURE_FLAGS.event_staff_enabled
      ? ticketingApi.scanTicket(payload) : Promise.reject({ code: 'FEATURE_DISABLED', message: 'Le scan de billets est désactivé.' }),
  });
}
export const useValidateTicketScan = useScanTicket;

export function useTicketScanHistory(eventId: string, filters: TicketPageFilters = {}) {
  return useQuery({
    queryKey: ticketingKeys.scanHistory(eventId, filters),
    queryFn: () => ticketingApi.getTicketScanHistory(eventId, filters),
    enabled: FEATURE_FLAGS.ticketing_enabled && FEATURE_FLAGS.event_staff_enabled && Boolean(eventId),
       placeholderData: keepPreviousData,
  });
}

export function useScannerAccess(eventId: string) {
  const dashboard = useEventTicketing(eventId);
  return { ...dashboard, isAuthorized: !dashboard.isError, canChangeGate: !dashboard.isError };
}
