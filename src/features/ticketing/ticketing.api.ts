import { apiGet, apiPost } from '@/services/api/client';
import type { CreateTicketOrderInput, CreateTicketTypeInput, OwnedTicket, PublicEventTickets, TicketAnalytics, TicketOrder, TicketScanResult, TicketType, TicketingDashboard } from './types';

export const TICKETING_API_AVAILABLE = true;
export const ticketingApi = {
  dashboard: (eventId: string) => apiGet<TicketingDashboard>(`/partners/me/events/${eventId}/ticketing`),
  createTicket: (eventId: string, input: CreateTicketTypeInput) =>
    apiPost<TicketType>(`/partners/me/events/${eventId}/tickets`, input),
  publicTickets: (eventId: string) => apiGet<PublicEventTickets>(`/events/${eventId}/tickets`),
  myTickets: () => apiGet<OwnedTicket[]>('/me/tickets'),
  myTicket: (ticketId: string) => apiGet<OwnedTicket>(`/me/tickets/${ticketId}`),
  validateScan: (eventId: string, input: { qrPayload: string; clientScanReference: string; gate: string }) =>
    apiPost<TicketScanResult>(`/partners/me/events/${eventId}/ticket-scans`, input),
  orders: (eventId: string) => apiGet<TicketOrder[]>(`/partners/me/events/${eventId}/ticket-orders`),
  createOrder: (eventId: string, input: CreateTicketOrderInput) => apiPost<TicketOrder>(`/events/${eventId}/ticket-orders`, input),
  analytics: (eventId: string) => apiGet<TicketAnalytics>(`/partners/me/events/${eventId}/ticketing/analytics`),
};
