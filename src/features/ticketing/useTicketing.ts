import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketingApi } from './ticketing.api';
import { mockOwnedTickets, mockPublicEventTickets, mockTicketingDashboards } from './mockData';
import type { CreateTicketOrderInput, CreateTicketTypeInput, OwnedTicketStatus, PublicEventTickets, TicketOrder, TicketType } from './types';
import { useAuthStore } from '@/features/auth/auth.store';

export const ticketKeys = {
  all: ['tickets'] as const,
  event: (eventId: string) => [...ticketKeys.all, 'event', eventId] as const,
  eventTypes: (eventId: string) => [...ticketKeys.event(eventId), 'types'] as const,
  orders: (eventId: string) => [...ticketKeys.event(eventId), 'orders'] as const,
  analytics: (eventId: string) => [...ticketKeys.event(eventId), 'analytics'] as const,
  publicTypes: (eventId: string) => [...ticketKeys.all, 'public', eventId] as const,
  mine: (status?: OwnedTicketStatus) => [...ticketKeys.all, 'mine', ...(status ? [status] : [])] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
};

function useDemo() { return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); }

export function useEventTicketTypes(eventId: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: ticketKeys.eventTypes(eventId), queryFn: async () => { if (!isDemo) return ticketingApi.dashboard(eventId); const dashboard = mockTicketingDashboards[eventId]; if (!dashboard) throw new Error('Billetterie indisponible'); return dashboard; }, enabled: Boolean(eventId) });
}
export const useEventTicketing = useEventTicketTypes;

export function useCreateTicketType(eventId: string) {
  const client = useQueryClient(); const isDemo = useDemo();
  return useMutation({
    mutationFn: async (input: CreateTicketTypeInput) => {
      if (!isDemo) return ticketingApi.createTicket(eventId, input);
      const dashboard = mockTicketingDashboards[eventId]; if (!dashboard) throw new Error('Événement introuvable');
      const ticket: TicketType = { id: `ticket-${Date.now()}`, eventId, name: input.name, price: input.price, stock: input.quantity, sold: 0, status: 'ACTIVE' };
      dashboard.ticketTypes.push(ticket); return ticket;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ticketKeys.eventTypes(eventId) }),
  });
}
export const useCreateTicket = useCreateTicketType;

export function useEventTickets(eventId: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: ticketKeys.publicTypes(eventId), queryFn: async (): Promise<PublicEventTickets> => !isDemo ? ticketingApi.publicTickets(eventId) : mockPublicEventTickets[eventId] ?? { eventId, eventName: 'Événement', currency: 'FCFA', tickets: [] }, enabled: Boolean(eventId) });
}

export function useTicketOrders(eventId: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: ticketKeys.orders(eventId), queryFn: () => !isDemo ? ticketingApi.orders(eventId) : Promise.resolve([] as TicketOrder[]), enabled: Boolean(eventId) });
}

export function useCreateTicketOrder(eventId: string) {
  const client = useQueryClient(); const isDemo = useDemo();
  return useMutation({
    mutationFn: (input: CreateTicketOrderInput) => !isDemo ? ticketingApi.createOrder(eventId, input) : Promise.resolve({ id: `order-${Date.now()}`, eventId, reference: 'DEMO', total: 0, currency: 'FCFA', status: 'PENDING' as const }),
    onSuccess: () => client.invalidateQueries({ queryKey: ticketKeys.orders(eventId) }),
  });
}

export function useMyTickets(status: OwnedTicketStatus) {
  const isDemo = useDemo();
  return useQuery({ queryKey: ticketKeys.mine(status), queryFn: async () => { const tickets = !isDemo ? await ticketingApi.myTickets() : mockOwnedTickets; return tickets.filter((ticket) => ticket.status === status); } });
}

export function useTicket(ticketId: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: ticketKeys.detail(ticketId), queryFn: async () => { if (!isDemo) return ticketingApi.myTicket(ticketId); const ticket = mockOwnedTickets.find((item) => item.id === ticketId); if (!ticket) throw new Error('Billet introuvable'); return ticket; }, enabled: Boolean(ticketId) });
}
export const useMyTicket = useTicket;

export function useScannerAccess(eventId: string) {
  const isPartner = useAuthStore((state) => state.user?.user_type === 'partner');
  const event = useEventTicketTypes(eventId);
  return { ...event, isAuthorized: Boolean(isPartner && event.data), canChangeGate: Boolean(isPartner && event.data) };
}

export function useScanTicket(eventId: string) {
  const isDemo = useDemo();
  return useMutation({
    mutationFn: async (input: { qrPayload: string; clientScanReference: string; gate: string }) => {
      if (isDemo) return { code: 'NETWORK_ERROR' as const };
      try { return await ticketingApi.validateScan(eventId, input); } catch { return { code: 'NETWORK_ERROR' as const }; }
    },
  });
}
export const useValidateTicketScan = useScanTicket;

export function useTicketAnalytics(eventId: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: ticketKeys.analytics(eventId), queryFn: () => !isDemo ? ticketingApi.analytics(eventId) : Promise.resolve({ sold: mockTicketingDashboards[eventId]?.sold ?? 0, revenue: mockTicketingDashboards[eventId]?.revenue ?? 0, checkedIn: mockTicketingDashboards[eventId]?.checkedIn ?? 0, entryRate: mockTicketingDashboards[eventId]?.entryRate ?? 0 }), enabled: Boolean(eventId) });
}
