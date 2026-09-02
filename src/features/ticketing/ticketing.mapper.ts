import type { CreatePartnerTicketTypePayload } from './ticketing.api';

export interface TicketFormValues {
  name: string; description: string; price: string; quantity: string;
  salesStartDate: string; salesEndDate: string; maxPerBuyer: string;
  accessZone: string; entryInstructions: string;
}

const instant = (date: string, end = false) => new Date(`${date}T${end ? '23:59:59.999' : '00:00:00.000'}Z`).toISOString();

export function ticketFormToCreateRequest(values: TicketFormValues): Omit<CreatePartnerTicketTypePayload, 'partnerId'> {
  return {
    code: values.name.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 50),
    name: values.name.trim(), description: values.description.trim() || undefined,
    price: Number(values.price), quantity: Number(values.quantity),
    salesStartAt: instant(values.salesStartDate), salesEndAt: instant(values.salesEndDate, true),
    maxTicketsPerBuyer: Number(values.maxPerBuyer),
    accessZone: values.accessZone.trim() || undefined,
    gateInstructions: values.entryInstructions.trim() || undefined,
  };
}
