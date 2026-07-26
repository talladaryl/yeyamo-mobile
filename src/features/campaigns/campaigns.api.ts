import { apiGet, apiPost } from '@/services/api/client';
import type { AnalyticsPeriod, Campaign, CampaignAnalytics, CampaignFilter, CampaignListResult, CreateCampaignInput } from './types';

export const campaignsApi = {
  list: (filter: CampaignFilter) =>
    apiGet<CampaignListResult>('/partners/me/campaigns', { params: { filter } }),
  detail: (id: string) => apiGet<Campaign>(`/partners/me/campaigns/${id}`),
  create: (input: CreateCampaignInput) => apiPost<Campaign>('/partners/me/campaigns', input),
  analytics: (id: string, period: AnalyticsPeriod) =>
    apiGet<CampaignAnalytics>(`/partners/me/campaigns/${id}/analytics`, { params: { period } }),
  pause: (id: string) => apiPost<Campaign>(`/partners/me/campaigns/${id}/pause`),
  resume: (id: string) => apiPost<Campaign>(`/partners/me/campaigns/${id}/resume`),
  submit: (id: string) => apiPost<Campaign>(`/partners/me/campaigns/${id}/submit`),
};
