import { apiGet, apiPost, apiPut } from '@/services/api/client';
import type {
  AnalyticsPeriod,
  Campaign,
  CampaignAnalytics,
  CampaignApiStatus,
  CampaignFilter,
  CampaignListResult,
  CampaignResponse,
  CreateCampaignRequest,
  SpringPage,
  UpdateCampaignRequest,
} from './types';

export interface CampaignListFilters {
  status?: CampaignApiStatus;
  page?: number;
  size?: number;
  sort?: string | string[];
}

export interface CampaignAnalyticsFilters {
  partnerId?: string;
  from?: string;
  to?: string;
  timezone?: string;
  page?: number;
  size?: number;
  period?: AnalyticsPeriod;
}

interface CampaignMetric {
  date: string;
  dimensionType: string;
  dimensionValue: string;
  impressions: number;
  qualifiedImpressions: number;
  uniqueReach: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  suppressed: boolean;
}

type Envelope<T> = T | { data: T };

function unwrap<T>(response: Envelope<T>): T {
  return typeof response === 'object'
    && response !== null
    && 'data' in response
    ? response.data
    : response;
}

function toCampaign(response: CampaignResponse): Campaign {
  return {
    id: response.id,
    name: response.name,
    visualUrl: response.creativeConfiguration.imageUrl
      ?? response.creativeConfiguration.videoUrl
      ?? '',
    promotedContent: response.creativeConfiguration.title
      ?? response.promotedEntityId,
    status: response.status === 'CANCELLED' ? 'COMPLETED' : response.status,
    totalBudget: response.totalBudget,
    amountSpent: response.spentAmount,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    performanceAvailable: false,
    startsAt: response.startAt,
    endsAt: response.endAt,
  };
}

function listParams(filters: CampaignListFilters | CampaignFilter) {
  if (typeof filters === 'string') {
    // Legacy UI groups multiple backend statuses in one filter, so request the
    // page without a single-status constraint and filter it after normalization.
    return { page: 0, size: 50 };
  }
  return {
    status: filters.status,
    page: filters.page ?? 0,
    size: filters.size ?? 20,
    sort: filters.sort,
  };
}

function periodRange(period: AnalyticsPeriod): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  if (period === '7D') from.setUTCDate(from.getUTCDate() - 6);
  else if (period === '30D') from.setUTCDate(from.getUTCDate() - 29);
  else from.setUTCFullYear(from.getUTCFullYear() - 1);
  const date = (value: Date) => value.toISOString().slice(0, 10);
  return { from: date(from), to: date(to) };
}

function normalizeAnalytics(page: SpringPage<CampaignMetric>): CampaignAnalytics {
  const totals = page.content.filter((metric) => metric.dimensionType === 'TOTAL');
  const latest = [...totals].sort((left, right) => left.date.localeCompare(right.date)).at(-1);
  const byDate = new Map<string, CampaignMetric>();
  for (const metric of totals) byDate.set(metric.date, metric);
  const dimension = (type: string) => {
    const values = page.content
      .filter((metric) => metric.dimensionType === type && !metric.suppressed);
    const total = values.reduce((sum, metric) => sum + metric.impressions, 0);
    return values.map((metric) => ({
      label: metric.dimensionValue,
      percentage: total === 0 ? 0 : (metric.impressions / total) * 100,
    }));
  };
  return {
    reach: totals.reduce((sum, metric) => sum + metric.uniqueReach, 0),
    impressions: totals.reduce((sum, metric) => sum + metric.impressions, 0),
    clicks: totals.reduce((sum, metric) => sum + metric.clicks, 0),
    conversions: totals.reduce((sum, metric) => sum + metric.conversions, 0),
    // Rates are server-computed. The API exposes daily aggregates, therefore
    // the most recent TOTAL row is used without recomputing financial KPIs.
    ctr: latest?.ctr ?? 0,
    cpc: latest?.cpc ?? 0,
    cpm: latest?.cpm ?? 0,
    cpa: latest?.cpa ?? 0,
    points: [...byDate.values()].map((metric) => ({
      label: metric.date,
      impressions: metric.impressions,
      clicks: metric.clicks,
      conversions: metric.conversions,
    })),
    cities: dimension('CITY'),
    placements: dimension('PLACEMENT'),
    devices: dimension('DEVICE'),
  };
}

export const campaignsApi = {
  async getPartnerCampaigns(
    filters: CampaignListFilters | CampaignFilter = {},
  ): Promise<CampaignListResult> {
    const response = await apiGet<Envelope<SpringPage<CampaignResponse>>>(
      '/campaigns',
      { params: listParams(filters) },
    );
    const page = unwrap(response);
    const allCampaigns = page.content.map(toCampaign);
    const campaigns = typeof filters === 'string' && filters !== 'ALL'
      ? allCampaigns.filter((campaign) => {
        if (filters === 'ACTIVE') {
          return ['APPROVED', 'ACTIVE', 'PAUSED', 'BUDGET_EXHAUSTED'].includes(campaign.status);
        }
        if (filters === 'PENDING') {
          return ['DRAFT', 'PENDING_REVIEW'].includes(campaign.status);
        }
        return ['COMPLETED', 'REJECTED'].includes(campaign.status);
      })
      : allCampaigns;
    return {
      campaigns,
      summary: allCampaigns.reduce(
        (summary, campaign) => ({
          amountSpent: summary.amountSpent + campaign.amountSpent,
          impressions: summary.impressions + campaign.impressions,
          clicks: summary.clicks + campaign.clicks,
          conversions: summary.conversions + campaign.conversions,
        }),
        { amountSpent: 0, impressions: 0, clicks: 0, conversions: 0 },
      ),
      performanceAvailable: false,
      pagination: {
        page: page.number,
        size: page.size,
        totalElements: page.totalElements,
        totalPages: page.totalPages,
        first: page.first,
        last: page.last,
      },
    };
  },

  async getCampaign(id: string): Promise<Campaign> {
    const response = await apiGet<Envelope<CampaignResponse>>(`/campaigns/${id}`);
    return toCampaign(unwrap(response));
  },

  async createCampaign(payload: CreateCampaignRequest): Promise<Campaign> {
    const response = await apiPost<Envelope<CampaignResponse>>('/campaigns', payload);
    return toCampaign(unwrap(response));
  },

  async updateCampaign(id: string, payload: UpdateCampaignRequest): Promise<Campaign> {
    const response = await apiPut<Envelope<CampaignResponse>>(`/campaigns/${id}`, payload);
    return toCampaign(unwrap(response));
  },

  async submitCampaign(id: string): Promise<Campaign> {
    const response = await apiPost<Envelope<CampaignResponse>>(`/campaigns/${id}/submit`);
    return toCampaign(unwrap(response));
  },

  async pauseCampaign(id: string): Promise<Campaign> {
    const response = await apiPost<Envelope<CampaignResponse>>(`/campaigns/${id}/pause`);
    return toCampaign(unwrap(response));
  },

  async resumeCampaign(id: string): Promise<Campaign> {
    const response = await apiPost<Envelope<CampaignResponse>>(`/campaigns/${id}/resume`);
    return toCampaign(unwrap(response));
  },

  async cancelCampaign(id: string): Promise<Campaign> {
    const response = await apiPost<Envelope<CampaignResponse>>(`/campaigns/${id}/cancel`);
    return toCampaign(unwrap(response));
  },

  async getCampaignAnalytics(
    id: string,
    filters: CampaignAnalyticsFilters | AnalyticsPeriod,
  ): Promise<CampaignAnalytics> {
    const options = typeof filters === 'string' ? { period: filters } : filters;
    const range = options.from && options.to
      ? { from: options.from, to: options.to }
      : periodRange(options.period ?? '30D');
    let partnerId = options.partnerId;
    if (!partnerId) {
      const campaign = unwrap(
        await apiGet<Envelope<CampaignResponse>>(`/campaigns/${id}`),
      );
      partnerId = campaign.partnerId;
    }
    const response = await apiGet<Envelope<SpringPage<CampaignMetric>>>(
      `/analytics/partners/${partnerId}/campaigns/${id}`,
      {
        params: {
          ...range,
          timezone: options.timezone ?? 'UTC',
          page: options.page ?? 0,
          size: options.size ?? 200,
        },
      },
    );
    return normalizeAnalytics(unwrap(response));
  },

  // Compatibility aliases for existing feature services.
  list: (filters: CampaignListFilters | CampaignFilter) =>
    campaignsApi.getPartnerCampaigns(filters),
  detail: (id: string) => campaignsApi.getCampaign(id),
  analytics: (id: string, filters: CampaignAnalyticsFilters | AnalyticsPeriod) =>
    campaignsApi.getCampaignAnalytics(id, filters),
  pause: (id: string) => campaignsApi.pauseCampaign(id),
  resume: (id: string) => campaignsApi.resumeCampaign(id),
  submit: (id: string) => campaignsApi.submitCampaign(id),
};
