import { v4 as uuidv4 } from 'uuid';
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type {
  CreateHoldRequest,
  CreateOrderRequest,
  CreateTicketOrderInput,
  CreateTicketTypeInput,
  HoldResponse,
  OwnedTicket,
  OwnedTicketStatus,
  PublicEventTickets,
  PublicTicketType,
  ScanRequest,
  ScanResponse,
  SpringTicketMetricsPage,
  TicketOrderResponse,
  TicketQrResponse,
  TicketDetailResponse,
  TicketOrder,
  TicketScanResult,
  TicketSummary,
  TicketTypeResponse,
} from './types';

export const TICKETING_API_AVAILABLE = true;

export class TicketEndpointUnavailableError extends Error {
  constructor(feature: string) {
    super(`${feature}: aucun endpoint correspondant n'est exposé par ticket-service`);
    this.name = 'TicketEndpointUnavailableError';
  }
}

export interface TicketPageFilters {
  page?: number;
  size?: number;
  status?: string;
}

export interface TicketAnalyticsFilters extends TicketPageFilters {
  partnerId: string;
  from: string;
  to: string;
  timezone?: string;
}

export interface CreatePartnerTicketTypePayload {
  partnerId: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  salesStartAt?: string;
  salesEndAt?: string;
  accessZone?: string;
  gateInstructions?: string;
  maxTicketsPerBuyer: number;
}

export interface CreateTicketOrderPayload extends CreateTicketOrderInput {
  promotionCode?: string;
  idempotencyKey?: string;
}

export interface StaffScanPayload {
  qrToken: string;
  eventId: string;
  gateId?: string;
  deviceId?: string;
  clientScanReference?: string;
  scannedAtClient?: string;
}

const unavailable = (feature: string): Promise<never> =>
  Promise.reject(new TicketEndpointUnavailableError(feature));

function ownedStatus(status: TicketSummary['status']): OwnedTicketStatus {
  if (status === 'USED') return 'USED';
  if (['CANCELLED', 'REFUNDED', 'EXPIRED', 'REVOKED'].includes(status)) return 'PAST';
  return 'UPCOMING';
}

function toOwnedTicket(ticket: TicketSummary): OwnedTicket {
  return {
    id: ticket.ticketId,
    eventTitle: ticket.eventId,
    eventImageUrl: '',
    eventDate: ticket.issuedAt,
    eventLocation: '',
    ticketType: '',
    accessZone: '',
    status: ownedStatus(ticket.status),
    maskedReference: ticket.serialNumber,
    qrCodeImageUrl: null,
  };
}

export const ticketingApi = {
  getEventTicketTypes: (eventId: string, partnerId: string): Promise<TicketTypeResponse[]> =>
    apiGet<TicketTypeResponse[]>(`/partners/${partnerId}/tickets/events/${eventId}/types`),

  createTicketType: (
    eventId: string,
    payload: CreatePartnerTicketTypePayload,
  ): Promise<TicketTypeResponse> => {
    if (!eventId || !payload.partnerId) return Promise.reject(new Error('eventId et partnerId sont obligatoires'));
    return apiPut<{ id: string }>(`/partners/${payload.partnerId}/tickets/configuration`, {
      eventId,
      salesStartAt: payload.salesStartAt,
      salesEndAt: payload.salesEndAt,
      maxTicketsPerBuyer: payload.maxTicketsPerBuyer,
      currency: 'XAF',
    }).then((configuration) => apiPost<TicketTypeResponse>(
      `/partners/${payload.partnerId}/tickets/configurations/${configuration.id}/types`,
      {
        code: payload.code,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        quantity: payload.quantity,
        salesStartAt: payload.salesStartAt,
        salesEndAt: payload.salesEndAt,
        accessZone: payload.accessZone,
        gateInstructions: payload.gateInstructions,
      },
    ));
  },

  getEventTicketOrders: (_eventId: string, _filters: TicketPageFilters = {}): Promise<never> =>
    unavailable("Liste partenaire des commandes d'un événement"),

  getTicketingAnalytics: (
    eventId: string,
    filters: TicketAnalyticsFilters,
  ): Promise<SpringTicketMetricsPage> =>
    apiGet<SpringTicketMetricsPage>(
      `/analytics/partners/${filters.partnerId}/ticket-events/${eventId}`,
      {
        params: {
          from: filters.from,
          to: filters.to,
          timezone: filters.timezone ?? 'UTC',
          page: filters.page ?? 0,
          size: filters.size ?? 50,
        },
      },
    ),

  getTicketScanHistory: (_eventId: string, _filters: TicketPageFilters = {}): Promise<never> =>
    unavailable('Historique détaillé des scans'),

  async getAvailableTicketTypes(eventId: string): Promise<PublicEventTickets> {
    const response = await apiGet<{ eventId: string; currency: string; tickets: Array<{ id: string; name: string; price: number; quantityAvailable: number }> }>(`/tickets/events/${eventId}/types`);
    return {
      eventId: response.eventId,
      currency: response.currency,
      tickets: response.tickets.map((ticket): PublicTicketType => ({ id: ticket.id, name: ticket.name, price: ticket.price, remaining: ticket.quantityAvailable, available: ticket.quantityAvailable > 0 })),
    };
  },

  getTicketOrder: (orderId: string): Promise<TicketOrderResponse> =>
    apiGet<TicketOrderResponse>(`/tickets/orders/${orderId}`),

  async createTicketOrder(
    eventId: string,
    payload: CreateTicketOrderPayload,
  ): Promise<TicketOrderResponse> {
    const idempotencyKey = payload.idempotencyKey ?? `ticket-hold-${uuidv4()}`;
    const hold = await apiPost<HoldResponse>(
      '/tickets/hold',
      {
        eventId,
        ticketTypeId: payload.ticketTypeId,
        quantity: payload.quantity,
      } satisfies CreateHoldRequest,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
    try {
      return await apiPost<TicketOrderResponse>(
        '/tickets/orders',
        {
          holdId: hold.holdId,
          promotionCode: payload.promotionCode ?? null,
        } satisfies CreateOrderRequest,
      );
    } catch (error) {
      // Compensate the hold if order creation fails. The original error is
      // still propagated and remains inspectable (409/422/etc.).
      try {
        await apiDelete<void>(`/tickets/hold/${hold.holdId}`);
      } catch (compensationError) {
        throw new AggregateError(
          [error, compensationError],
          `La commande a échoué et le hold ${hold.holdId} n'a pas pu être libéré`,
        );
      }
      throw error;
    }
  },

  async getMyTickets(filters: TicketPageFilters = {}): Promise<TicketSummary[]> {
    return apiGet<TicketSummary[]>('/tickets/my-tickets', { params: { status: filters.status } });
  },

  getTicket: (ticketId: string): Promise<TicketDetailResponse> =>
    apiGet<TicketDetailResponse>(`/tickets/${ticketId}`),

  getTicketQrCredential: (ticketId: string): Promise<TicketQrResponse> =>
    apiGet<TicketQrResponse>(`/tickets/${ticketId}/qr`),

  scanTicket: (payload: StaffScanPayload): Promise<ScanResponse> =>
    apiPost<ScanResponse>(
      '/tickets/scan',
      {
        qrToken: payload.qrToken,
        eventId: payload.eventId,
        gateId: payload.gateId ?? null,
        deviceId: payload.deviceId ?? null,
        offlineReference: payload.clientScanReference ?? null,
        scannedAt: payload.scannedAtClient ?? new Date().toISOString(),
      } satisfies ScanRequest,
    ),

  // Compatibility surface for the existing screens. Missing backend routes
  // remain explicit failures rather than fabricated URLs.
  dashboard: (eventId: string) => unavailable(`Dashboard enrichi de l'événement ${eventId}`),
  createTicket: (eventId: string, input: CreateTicketTypeInput) =>
    unavailable(`Création ticket type sans partnerId/configuration (${eventId}/${input.name})`),
  publicTickets: (eventId: string) => ticketingApi.getAvailableTicketTypes(eventId),
  myTickets: async () => (await ticketingApi.getMyTickets()).map(toOwnedTicket),
  myTicket: (_ticketId: string): Promise<OwnedTicket> =>
    unavailable('Détail enrichi du billet'),
  validateScan: (eventId: string, input: { qrPayload: string; clientScanReference: string; gate: string }) =>
    ticketingApi.scanTicket({
      eventId,
      qrToken: input.qrPayload,
      clientScanReference: input.clientScanReference,
      gateId: input.gate,
    }).then((response): TicketScanResult => ({
      code: ['VALID', 'ALREADY_USED', 'INVALID', 'WRONG_EVENT', 'REFUNDED', 'CANCELLED']
        .includes(response.result)
        ? response.result as TicketScanResult['code']
        : 'INVALID',
    })),
  orders: (eventId: string) => ticketingApi.getEventTicketOrders(eventId),
  createOrder: async (eventId: string, input: CreateTicketOrderInput): Promise<TicketOrder> => {
    const order = await ticketingApi.createTicketOrder(eventId, input);
    return {
      id: order.orderId,
      eventId,
      reference: order.reference,
      total: order.totalAmount,
      currency: order.currency,
      status: order.status === 'PAID' || order.status === 'ISSUED'
        ? 'PAID'
        : order.status === 'CANCELLED' || order.status === 'EXPIRED' || order.status === 'REFUNDED'
          ? 'CANCELLED'
          : 'PENDING',
    };
  },
  analytics: (_eventId: string): Promise<never> =>
    unavailable('Analytics sans partnerId et période'),
};
