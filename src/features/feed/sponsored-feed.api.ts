import { apiGet } from '@/services/api/client';
import type { SponsoredFeedItem } from './types';
export const sponsoredFeedApi = {
  deliveries: (regionId?: number) => apiGet<SponsoredFeedItem[]>('/feed/sponsored', { params: { regionId } }),
};
