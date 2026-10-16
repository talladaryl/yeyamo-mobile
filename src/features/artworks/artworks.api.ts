import { apiGet, apiPost } from '@/services/api/client';
import { createIdempotencyKey } from '@/services/api/contracts';
import type { SpringPage } from '@/services/api/contracts';
import type { ArtworkDetail, ArtworkFilters, ArtworkHistory, ArtworkMedia, ArtworkOffer, ArtworkOfferInput, ArtworkRequest } from './artworks.types';
import { traceMediaRuntime } from '@/features/media/media.runtime-trace';
import { mapArtworkDetail, mapArtworkPage, type ArtworkApiDto } from './artworks.mappers';
const params = <T extends object>(values: T) => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''));
export const artworksApi = {
  list: async (filters: ArtworkFilters) => mapArtworkPage(await apiGet<SpringPage<ArtworkApiDto>>('/artworks', { params: params(filters) })),
  detail: async (id: string) => mapArtworkDetail(await apiGet<ArtworkApiDto>(`/artworks/${id}`)),
  history: (id: string) => apiGet<ArtworkHistory[]>(`/artworks/${id}/history`),
  media: (id: string) => apiGet<ArtworkMedia[]>(`/artworks/${id}/media`),
  related: async (id: string) => mapArtworkPage(await apiGet<SpringPage<ArtworkApiDto>>(`/artworks/${id}/related`)),
  byArtisan: async (artisanId: string, page = 0, size = 20) => mapArtworkPage(await apiGet<SpringPage<ArtworkApiDto>>(`/artisans/${artisanId}/artworks`, { params: { page, size } })),
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
