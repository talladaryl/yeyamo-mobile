import { apiGet, apiPost } from '@/services/api/client';
import type { CreatePromotionInput, Promotion, PromotionStatus } from './types';
export const promotionsApi = {
  list: (status: PromotionStatus) => apiGet<Promotion[]>('/partners/me/promotions', { params: { status } }),
  create: (input: CreatePromotionInput) => apiPost<Promotion>('/partners/me/promotions', input),
};
