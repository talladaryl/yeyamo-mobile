export type TicketTypeStatus = 'ACTIVE' | 'SOLD_OUT' | 'DRAFT' | 'SALES_CLOSED';
export type TicketStatus = 'PENDING_PAYMENT' | 'VALID' | 'USED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED' | 'REVOKED';
export type TicketOrderStatus = 'CREATED' | 'AWAITING_PAYMENT' | 'PAID' | 'ISSUED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type ScanResult = 'VALID' | 'ALREADY_USED' | 'INVALID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED' | 'WRONG_EVENT' | 'WRONG_GATE' | 'NOT_YET_VALID' | 'ACCESS_DENIED';
export type StaffRole = 'EVENT_MANAGER' | 'ACCESS_CONTROLLER' | 'CASHIER' | 'SUPERVISOR';

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
  eventName?: string | null;
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
  | 'VALID' | 'ALREADY_USED' | 'INVALID' | 'WRONG_EVENT'
  | 'REFUNDED' | 'CANCELLED' | 'NETWORK_ERROR';

export interface TicketScanResult {
  code: ScanResultCode;
  checkedInCount?: number;
}

export interface TicketOrder {
  id: string; eventId: string; reference: string; total: number; currency: string; status: 'PENDING' | 'PAID' | 'CANCELLED';
}
export interface CreateTicketOrderInput { ticketTypeId: string; quantity: number }
export interface TicketAnalytics { sold: number; revenue: number; checkedIn: number; entryRate: number }

export interface CreateHoldRequest { eventId: string; ticketTypeId: string; quantity: number }
export interface HoldResponse { holdId: string; quantity: number; expiresAt: string; status: string }
export interface CreateOrderRequest { holdId: string; promotionCode: string | null }
export interface TicketOrderResponse {
  orderId: string; reference: string; status: TicketOrderStatus; paymentStatus: string;
  totalAmount: number; currency: string; expiresAt: string;
}
export interface TicketSummary {
  ticketId: string; serialNumber: string; eventId: string; status: TicketStatus;
  issuedAt: string; usedAt: string | null;
}
export interface TicketQrResponse {
  ticketId: string; serialNumber: string; eventId: string; status: TicketStatus; qrToken: string;
}
export interface TicketDetailResponse {
  ticketId: string; orderId: string; eventId: string; ticketTypeId: string;
  serialNumber: string; status: TicketStatus; issuedAt: string | null;
  usedAt: string | null; cancelledAt: string | null; refundedAt: string | null;
  createdAt: string;
}
export interface ScanRequest {
  qrToken: string; eventId: string; gateId: string | null; deviceId: string | null;
  offlineReference: string | null; scannedAt: string | null;
}
export interface ScanResponse {
  result: ScanResult; reasonCode: string | null; ticketReferenceMasked: string | null;
  eventId: string; ticketTypeName: string | null; accessZone: string | null;
  ownerDisplayNameMasked: string | null; usedAt: string | null;
  firstScannerNameMasked: string | null; scanId: string;
}
export interface ScanStatistics {
  eventId: string; validScans: number; alreadyUsedAttempts: number; invalidAttempts: number;
  accessDeniedAttempts: number; totalScans: number; successRate: number;
}

export interface TicketTypeResponse {
  id: string;
  saleConfigurationId: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  quantityTotal: number;
  quantityReserved: number;
  quantitySold: number;
  salesStartAt: string | null;
  salesEndAt: string | null;
  accessZone: string | null;
  gateInstructions: string | null;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAnalyticsMetric {
  date: string;
  dimensionType: string;
  dimensionValue: string;
  ticketsSold: number;
  scans: number;
  rejectedScans: number;
  revenue: number;
  commission: number;
  refunds: number;
  attendanceRate: number;
  suppressed: boolean;
}

export interface SpringTicketMetricsPage {
  content: TicketAnalyticsMetric[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
