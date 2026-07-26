import { campaignsApi } from './campaigns.api';
import { mockCampaignAnalytics, mockCampaigns } from './mockData';
import type { AnalyticsPeriod, Campaign, CampaignFilter, CampaignListResult, CampaignStatus, CreateCampaignInput } from './types';

const FILTER_STATUSES: Record<Exclude<CampaignFilter, 'ALL'>, CampaignStatus[]> = {
  ACTIVE: ['APPROVED', 'ACTIVE', 'PAUSED', 'BUDGET_EXHAUSTED'],
  PENDING: ['DRAFT', 'PENDING_REVIEW'],
  COMPLETED: ['COMPLETED', 'REJECTED'],
};

function filterCampaigns(campaigns: Campaign[], filter: CampaignFilter) {
  return filter === 'ALL'
    ? campaigns
    : campaigns.filter((campaign) => FILTER_STATUSES[filter].includes(campaign.status));
}

function buildSummary(campaigns: Campaign[]) {
  return campaigns.reduce(
    (summary, campaign) => ({
      amountSpent: summary.amountSpent + campaign.amountSpent,
      impressions: summary.impressions + campaign.impressions,
      clicks: summary.clicks + campaign.clicks,
      conversions: summary.conversions + campaign.conversions,
    }),
    { amountSpent: 0, impressions: 0, clicks: 0, conversions: 0 },
  );
}

export const campaignsService = {
  async list(filter: CampaignFilter, isDemo = false): Promise<CampaignListResult> {
    if (!isDemo) return campaignsApi.list(filter);
    const campaigns = filterCampaigns(mockCampaigns, filter);
    return { campaigns, summary: buildSummary(mockCampaigns) };
  },
  async detail(id: string, isDemo = false): Promise<Campaign> {
    if (!isDemo) return campaignsApi.detail(id);
    const campaign = mockCampaigns.find((item) => item.id === id);
    if (!campaign) throw new Error('Campagne introuvable');
    return campaign;
  },
  async analytics(id: string, period: AnalyticsPeriod, isDemo = false) {
    if (!isDemo) return campaignsApi.analytics(id, period);
    if (!mockCampaigns.some((item) => item.id === id)) throw new Error('Campagne introuvable');
    return mockCampaignAnalytics(period);
  },
  create: async (input: CreateCampaignInput, isDemo = false) => {
    if (!isDemo) return campaignsApi.create(input);
    const campaign: Campaign = { id: `campaign-${Date.now()}`, visualUrl: '', amountSpent: 0, impressions: 0, clicks: 0, conversions: 0, status: 'DRAFT', ...input };
    mockCampaigns.push(campaign);
    return campaign;
  },
  pause: (id: string, isDemo = false) => transition(id, 'PAUSED', campaignsApi.pause, isDemo),
  resume: (id: string, isDemo = false) => transition(id, 'ACTIVE', campaignsApi.resume, isDemo),
  submit: (id: string, isDemo = false) => transition(id, 'PENDING_REVIEW', campaignsApi.submit, isDemo),
};

async function transition(id: string, status: CampaignStatus, apiAction: (id: string) => Promise<Campaign>, isDemo: boolean) {
  if (!isDemo) return apiAction(id);
  const campaign = mockCampaigns.find((item) => item.id === id);
  if (!campaign) throw new Error('Campagne introuvable');
  campaign.status = status;
  return { ...campaign };
}
