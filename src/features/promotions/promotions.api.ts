import { apiGet, apiPost, apiPut } from '@/services/api/client';
import type { SpringPage } from '@/services/api/contracts';
import type { CreatePromotionRequest, PromotionApiStatus, PromotionResponse } from './types';

export interface PromotionFilters {
  partnerId?: string;
  status?: PromotionApiStatus;
  page?: number;
  size?: number;
  sort?: string;
}

const adminBase = '/commerce/admin/promotions';
const partnerBase = (partnerId: string) => `/commerce/partners/${partnerId}/promotions`;
function body(payload: CreatePromotionRequest) { const { partnerId: _partnerId, ...request } = payload; return request; }

export const promotionsApi = {
  getPromotions: (filters: PromotionFilters = {}) =>
    apiGet<SpringPage<PromotionResponse>>(filters.partnerId ? partnerBase(filters.partnerId) : adminBase, { params: { ...filters, partnerId: undefined } }),
  getPromotion: (id: string, partnerId?: string) => apiGet<PromotionResponse>(`${partnerId ? partnerBase(partnerId) : adminBase}/${id}`),
  createPromotion: (payload: CreatePromotionRequest) => apiPost<PromotionResponse>(payload.partnerId ? partnerBase(payload.partnerId) : adminBase, body(payload)),
  updatePromotion: (id: string, payload: CreatePromotionRequest) =>
    apiPut<PromotionResponse>(`${payload.partnerId ? partnerBase(payload.partnerId) : adminBase}/${id}`, body(payload)),
  disablePromotion: (id: string, partnerId?: string) => apiPost<PromotionResponse>(`${partnerId ? partnerBase(partnerId) : adminBase}/${id}/disable`),
};
