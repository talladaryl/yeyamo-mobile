import { apiGet } from '@/services/api/client';
import type { RecommendationPage, RecommendationRequest } from './recommendations.types';
import type { AppApiError } from '@/types/api.types';
import { traceSocialRuntime } from '@/features/social/social.runtime-trace';

function isOptionalRecommendationFailure(error: unknown): boolean {
  const apiError = error as AppApiError;
  return apiError.isNetworkError === true
    || apiError.code === 'SERVICE_UNAVAILABLE'
    || (typeof apiError.status === 'number' && apiError.status >= 500);
}

export const recommendationsApi = {
  list: async ({ latitude, longitude, languageCodes, context, page = 0, size = 12 }: RecommendationRequest = {}) => {
    try {
      return await apiGet<RecommendationPage>('/recommendations', {
        params: {
          ...(latitude !== undefined && longitude !== undefined ? { lat: latitude, lng: longitude } : {}),
          ...(languageCodes?.length ? { languageCodes: languageCodes.join(',') } : {}),
          ...(context ? { ctx: context } : {}),
          page,
          size,
        },
      });
    } catch (error) {
      if (!isOptionalRecommendationFailure(error)) throw error;
      const apiError = error as AppApiError;
      traceSocialRuntime('RECOMMENDATIONS_DEGRADED', {
        flow: 'recommendations',
        reason: apiError.isNetworkError ? 'network' : apiError.code ?? 'server',
        status: apiError.status ?? null,
      });
      return { page, size, hasNext: false, items: [], generatedAt: new Date().toISOString() };
    }
  },
};
