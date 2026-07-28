export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'BUDGET_EXHAUSTED';
export type CampaignApiStatus = CampaignStatus | 'CANCELLED';

export type CampaignObjective =
  | 'AWARENESS' | 'TRAFFIC' | 'ENGAGEMENT' | 'EVENT_TICKET_SALES'
  | 'BOOKING' | 'STORE_VISIT' | 'FOLLOW_PARTNER';
export type BillingModel = 'CPM' | 'CPC' | 'CPA' | 'FIXED_BUDGET';
export type PromotedEntityType = 'PLACE' | 'EVENT' | 'POST' | 'PARTNER_PROFILE' | 'EXPERIENCE';

export interface TargetConfiguration {
  countryCodes: string[];
  regionIds: string[];
  cityIds: string[];
  districtIds: string[];
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  minimumAge: number | null;
  maximumAge: number | null;
  interestIds: string[];
  categoryIds: string[];
  languageCodes: string[];
  activeDays: string[];
  startHour: number | null;
  endHour: number | null;
  excludedUserIds: string[];
  frequencyCapPerUserPerDay: number | null;
  frequencyCapPerUserTotal: number | null;
}

export interface CreativeConfiguration {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  callToAction: string | null;
  destinationUrl: string | null;
}

/** Exact CampaignResponse returned by campaign-service. */
export interface CampaignResponse {
  id: string;
  partnerId: string;
  name: string;
  objective: CampaignObjective;
  promotedEntityType: PromotedEntityType;
  promotedEntityId: string;
  status: CampaignApiStatus;
  billingModel: BillingModel;
  totalBudget: number;
  dailyBudget: number;
  currency: string;
  startAt: string;
  endAt: string;
  targetConfiguration: TargetConfiguration;
  creativeConfiguration: CreativeConfiguration;
  spentAmount: number;
  createdBy: string;
  approvedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateCampaignRequest {
  name: string;
  objective: CampaignObjective;
  promotedEntityType: PromotedEntityType;
  promotedEntityId: string;
  billingModel: BillingModel;
  totalBudget: number;
  dailyBudget: number;
  currency: string;
  startAt: string;
  endAt: string;
  targetConfiguration: TargetConfiguration;
  creativeConfiguration: CreativeConfiguration;
}

export type UpdateCampaignRequest = Omit<CreateCampaignRequest, 'promotedEntityType' | 'promotedEntityId' | 'currency'>;

export interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

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
  /** False when the campaign list endpoint did not include analytics. */
  performanceAvailable?: boolean;
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
  performanceAvailable?: boolean;
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
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
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  points: CampaignAnalyticsPoint[];
  cities: Array<{ label: string; percentage: number }>;
  placements: Array<{ label: string; percentage: number }>;
  devices: Array<{ label: string; percentage: number }>;
}
