import { apiGet, apiPost } from '@/services/api/client';
import { createIdempotencyKey } from '@/services/api/contracts';
import type { SpringPage } from '@/services/api/contracts';
import type { Artwork, ArtworkDetail, ArtworkFilters, ArtworkHistory, ArtworkMedia, ArtworkOffer, ArtworkOfferInput, ArtworkRequest } from './artworks.types';
import { traceMediaRuntime } from '@/features/media/media.runtime-trace';
const params = <T extends object>(values: T) => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''));
export const artworksApi = {
  list: (filters: ArtworkFilters) => apiGet<SpringPage<Artwork>>('/artworks', { params: params(filters) }),
  detail: (id: string) => apiGet<ArtworkDetail>(`/artworks/${id}`),
  history: (id: string) => apiGet<ArtworkHistory[]>(`/artworks/${id}/history`),
  media: (id: string) => apiGet<ArtworkMedia[]>(`/artworks/${id}/media`),
  related: (id: string) => apiGet<SpringPage<Artwork>>(`/artworks/${id}/related`),
  byArtisan: (artisanId: string, page = 0, size = 20) => apiGet<SpringPage<Artwork>>(`/artisans/${artisanId}/artworks`, { params: { page, size } }),
  offer: (artworkId: string) => apiGet<ArtworkOffer>(`/artwork-offers/${artworkId}`),
  create: async (input: ArtworkRequest) => {
    try {
      traceMediaRuntime('ARTWORK_CREATE_DISPATCHED', { flow: 'artwork', url: '/artworks', mediaCount: input.mediaIds.length });
      const created = await apiPost<ArtworkDetail>('/artworks', input, { yeyamoTrace: { flow: 'artwork', stage: 'ARTWORK_CREATE' } });
      return created;
    } catch (error) {
      traceMediaRuntime('ARTWORK_CREATE_ERROR', { flow: 'artwork', url: '/artworks' });
      throw error;
    }
  },
  createOffer: async (input: ArtworkOfferInput) => {
    try {
      traceMediaRuntime('ARTWORK_OFFER_CREATE_DISPATCHED', { flow: 'artwork', url: '/artwork-offers' });
      const created = await apiPost<ArtworkOffer>('/artwork-offers', input, { headers: { 'Idempotency-Key': createIdempotencyKey() }, yeyamoTrace: { flow: 'artwork', stage: 'ARTWORK_OFFER_CREATE' } });
      return created;
    } catch (error) {
      traceMediaRuntime('ARTWORK_OFFER_CREATE_ERROR', { flow: 'artwork', url: '/artwork-offers' });
      throw error;
    }
  },
};
