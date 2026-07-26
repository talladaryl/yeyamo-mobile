import { apiPost } from '@/services/api/client';

export interface AdTrackingInput {
  deliveryId: string;
  trackingToken: string;
}

export const adsApi = {
  trackImpression: (input: AdTrackingInput) => apiPost<void>('/ads/impressions', input),
  trackClick: (input: AdTrackingInput) => apiPost<void>('/ads/clicks', input),
};
