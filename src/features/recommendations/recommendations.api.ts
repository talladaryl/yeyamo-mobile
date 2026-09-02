import { apiGet } from '@/services/api/client';
import type { RecommendationPage, RecommendationRequest } from './recommendations.types';

export const recommendationsApi = {
  list: ({ latitude, longitude, languageCodes, context, page = 0, size = 12 }: RecommendationRequest = {}) =>
    apiGet<RecommendationPage>('/recommendations', {
      params: {
        ...(latitude !== undefined && longitude !== undefined ? { lat: latitude, lng: longitude } : {}),
        ...(languageCodes?.length ? { languageCodes: languageCodes.join(',') } : {}),
        ...(context ? { ctx: context } : {}),
        page,
        size,
      },
    }),
};
