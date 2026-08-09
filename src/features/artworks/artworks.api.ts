import { apiGet, apiPost } from '@/services/api/client';
import { createIdempotencyKey } from '@/services/api/contracts';
import type { SpringPage } from '@/services/api/contracts';
import type { Artwork, ArtworkDetail, ArtworkFilters, ArtworkHistory, ArtworkMedia, ArtworkOffer, ArtworkOfferInput, ArtworkRequest } from './artworks.types';
const params = <T extends object>(values: T) => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''));
export const artworksApi = {
  list: (filters: ArtworkFilters) => apiGet<SpringPage<Artwork>>('/artworks', { params: params(filters) }),
  detail: (id: string) => apiGet<ArtworkDetail>(`/artworks/${id}`),
  history: (id: string) => apiGet<ArtworkHistory[]>(`/artworks/${id}/history`),
  media: (id: string) => apiGet<ArtworkMedia[]>(`/artworks/${id}/media`),
  related: (id: string) => apiGet<SpringPage<Artwork>>(`/artworks/${id}/related`),
  byArtisan: (artisanId: string, page = 0, size = 20) => apiGet<SpringPage<Artwork>>(`/artisans/${artisanId}/artworks`, { params: { page, size } }),
  offer: (artworkId: string) => apiGet<ArtworkOffer>(`/artwork-offers/${artworkId}`),
  create: (input: ArtworkRequest) => apiPost<ArtworkDetail>('/artworks', input),
  createOffer: (input: ArtworkOfferInput) => apiPost<ArtworkOffer>('/artwork-offers', input, { headers: { 'Idempotency-Key': createIdempotencyKey() } }),
};
