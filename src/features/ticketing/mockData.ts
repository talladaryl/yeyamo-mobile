import type { OwnedTicket, PublicEventTickets, TicketingDashboard } from './types';

export const mockTicketingDashboards: Record<string, TicketingDashboard> = {
  '1': {
    eventId: '1',
    eventName: 'Vendu Juin à Douala',
    sold: 184,
    revenue: 3680000,
    checkedIn: 126,
    entryRate: 68.5,
    ticketTypes: [
      { id: 'standard', eventId: '1', name: 'Entrée standard', price: 15000, stock: 180, sold: 142, status: 'ACTIVE' },
      { id: 'vip', eventId: '1', name: 'Pass VIP', price: 35000, stock: 50, sold: 42, status: 'ACTIVE' },
      { id: 'early', eventId: '1', name: 'Early bird', price: 10000, stock: 60, sold: 60, status: 'SOLD_OUT' },
    ],
  },
  '3': {
    eventId: '3',
    eventName: 'Fête de la Musique',
    sold: 75,
    revenue: 750000,
    checkedIn: 0,
    entryRate: 0,
    ticketTypes: [
      { id: 'general', eventId: '3', name: 'Accès général', price: 10000, stock: 250, sold: 75, status: 'ACTIVE' },
    ],
  },
};

export const mockPublicEventTickets: Record<string, PublicEventTickets> = {
  '1': {
    eventId: '1',
    eventName: 'Concert Live à Douala',
    currency: 'FCFA',
    tickets: [
      { id: '1', name: 'Billet standard', price: 5000, remaining: 120, available: true },
      { id: '2', name: 'VIP', price: 10000, remaining: 28, available: true },
    ],
  },
};

export const mockOwnedTickets: OwnedTicket[] = [
  { id: 'owned-ticket-1', eventTitle: 'Concert Live à Douala', eventImageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=900', eventDate: '2026-08-14T20:00:00.000Z', eventLocation: 'La Falaise Resort, Douala', ticketType: 'Pass VIP', accessZone: 'Carré VIP', status: 'UPCOMING', maskedReference: 'YYM-••••-84K2', qrCodeImageUrl: null },
  { id: 'owned-ticket-2', eventTitle: 'Brunch panoramique', eventImageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900', eventDate: '2026-07-12T11:00:00.000Z', eventLocation: 'Bonapriso, Douala', ticketType: 'Standard', accessZone: 'Salle principale', status: 'USED', maskedReference: 'YYM-••••-19PL', qrCodeImageUrl: null },
  { id: 'owned-ticket-3', eventTitle: 'Week-end bien-être', eventImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900', eventDate: '2026-05-24T09:00:00.000Z', eventLocation: 'La Falaise Resort, Douala', ticketType: 'Premium', accessZone: 'Spa', status: 'PAST', maskedReference: 'YYM-••••-62DR', qrCodeImageUrl: null },
];
