import { apiGet } from '@/services/api/client';
import { mediaContentUrl } from '@/services/api/contracts';
import type { CatalogExperience } from './types';

export const experiencesApi = {
  detail: (id: string) => apiGet<CatalogExperience>(`/catalog/assets/${id}`),
  mediaUrls: (mediaIds: string[]) => mediaIds.map((mediaId) => mediaContentUrl(mediaId)),
};
