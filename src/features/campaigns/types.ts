export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'BUDGET_EXHAUSTED';

export type CampaignFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED';

export interface Campaign {
  id: string;
  name: string;
  visualUrl: string;
  promotedContent: string;
  status: CampaignStatus;
  totalBudget: number;
  amountSpent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startsAt: string;
  endsAt: string;
}

export interface CampaignSummary {
  amountSpent: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface CampaignListResult {
  campaigns: Campaign[];
  summary: CampaignSummary;
}

export type CreateCampaignInput = Pick<Campaign, 'name' | 'promotedContent' | 'totalBudget' | 'startsAt' | 'endsAt'>;

export type AnalyticsPeriod = '7D' | '30D' | 'ALL';

export interface CampaignAnalyticsPoint {
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface CampaignAnalytics {
  reach: number;
  points: CampaignAnalyticsPoint[];
  cities: Array<{ label: string; percentage: number }>;
  placements: Array<{ label: string; percentage: number }>;
  devices: Array<{ label: string; percentage: number }>;
}
