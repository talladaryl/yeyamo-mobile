import { apiDelete, apiGet, apiPost } from '@/services/api/client';
import type {
  AdventurePlanDetail,
  AdventurePlanPage,
  AdventurePlanPreview,
  AdventurePlanRequest,
  AdventureSkipResponse,
} from './adventure.types';

const basePath = '/explore/adventure-plans';

export const adventureApi = {
  previewAdventurePlan: (request: AdventurePlanRequest) =>
    apiPost<AdventurePlanPreview>(`${basePath}/preview`, request),
  createAdventurePlan: (request: AdventurePlanRequest) =>
    apiPost<AdventurePlanDetail>(basePath, request),
  getAdventurePlans: (page = 0, size = 20) =>
    apiGet<AdventurePlanPage>(basePath, { params: { page, size } }),
  getAdventurePlan: (planId: string) =>
    apiGet<AdventurePlanDetail>(`${basePath}/${encodeURIComponent(planId)}`),
  deleteAdventurePlan: (planId: string) =>
    apiDelete<void>(`${basePath}/${encodeURIComponent(planId)}`),
  skipAdventureRecommendation: (planId: string, recommendationId: string) =>
    apiPost<AdventureSkipResponse>(`${basePath}/${encodeURIComponent(planId)}/recommendations/${encodeURIComponent(recommendationId)}/skip`),
};
