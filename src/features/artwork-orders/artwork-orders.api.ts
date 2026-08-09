import { apiGet, apiPatch, apiPost } from '@/services/api/client';
import { createIdempotencyKey } from '@/services/api/contracts';
import type { ArtworkOrder, CreateArtworkOrderInput } from './artwork-orders.types';
export const artworkOrdersApi = {
  mine: () => apiGet<ArtworkOrder[]>('/artwork-orders/me'), detail: (id: string) => apiGet<ArtworkOrder>(`/artwork-orders/${id}`),
  create: (input: CreateArtworkOrderInput) => apiPost<ArtworkOrder>('/artwork-orders', input, { headers: { 'Idempotency-Key': createIdempotencyKey() } }),
  cancel: (id: string, reason: string) => apiPost<ArtworkOrder>(`/artwork-orders/${id}/cancel`, { reason }),
  artisan: () => apiGet<ArtworkOrder[]>('/artisan/orders'), artisanDetail: (id: string) => apiGet<ArtworkOrder>(`/artisan/orders/${id}`),
  artisanStatus: (id: string, status: ArtworkOrder['status'], reason: string) => apiPatch<ArtworkOrder>(`/artisan/orders/${id}/status`, { status, reason }),
};
