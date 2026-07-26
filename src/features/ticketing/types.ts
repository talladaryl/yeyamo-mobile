export type TicketTypeStatus = 'ACTIVE' | 'SOLD_OUT' | 'DRAFT' | 'SALES_CLOSED';

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  status: TicketTypeStatus;
}

export interface TicketingDashboard {
  eventId: string;
  eventName: string;
  sold: number;
  revenue: number;
  checkedIn: number;
  entryRate: number;
  ticketTypes: TicketType[];
}

export interface CreateTicketTypeInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  salesStartDate: string;
  salesEndDate: string;
  maxPerBuyer: number;
  accessZone: string;
  entryInstructions: string;
}

export interface PublicTicketType {
  id: string;
  name: string;
  price: number;
  remaining: number;
  available: boolean;
}

export interface PublicEventTickets {
  eventId: string;
  eventName: string;
  currency: string;
  tickets: PublicTicketType[];
}

export type OwnedTicketStatus = 'UPCOMING' | 'USED' | 'PAST';

export interface OwnedTicket {
  id: string;
  eventTitle: string;
  eventImageUrl: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  accessZone: string;
  status: OwnedTicketStatus;
  maskedReference: string;
  qrCodeImageUrl: string | null;
}

export type ScanResultCode =
  | 'VALID'
  | 'ALREADY_USED'
  | 'INVALID'
  | 'WRONG_EVENT'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'NETWORK_ERROR';

export interface TicketScanResult {
  code: ScanResultCode;
  checkedInCount?: number;
}

export interface TicketOrder {
  id: string; eventId: string; reference: string; total: number; currency: string; status: 'PENDING' | 'PAID' | 'CANCELLED';
}
export interface CreateTicketOrderInput { ticketTypeId: string; quantity: number }
export interface TicketAnalytics { sold: number; revenue: number; checkedIn: number; entryRate: number }
