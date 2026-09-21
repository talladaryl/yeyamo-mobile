import type { SpringPage } from '@/services/api/contracts';

export type AdventurePartyType = 'SOLO' | 'FAMILY' | 'FRIENDS' | 'COUPLE';
export type AdventureBudgetTier = 'STANDARD' | 'MEDIUM' | 'PREMIUM' | 'CUSTOM';
export type AdventureTargetType = 'PLACE' | 'EVENT' | 'ACTIVITY' | 'CULTURE_CONTENT';
export type AdventureAvailabilityStatus = 'CONFIRMED' | 'UNKNOWN' | 'UNAVAILABLE' | 'CANCELLED';

export interface AdventureBudgetRequest {
  tier?: AdventureBudgetTier | null;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  currencyCode?: string | null;
}

export interface AdventurePlanRequest {
  countryCode: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  partyType: AdventurePartyType;
  interestCodes: string[];
  budget?: AdventureBudgetRequest | null;
}

export interface AdventureCriteria {
  countryCode: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  partyType: AdventurePartyType;
  interestCodes: string[];
  budgetTier: AdventureBudgetTier | null;
  minimumAmount: number | null;
  maximumAmount: number | null;
  currencyCode: string | null;
}

export interface AdventureRecommendation {
  recommendationId: string;
  targetType: AdventureTargetType;
  targetId: string;
  scheduledAt: string | null;
  reasonCodes: string[];
  title: string;
  imageMediaId: string | null;
  locationLabel: string | null;
  startsAt: string | null;
  endsAt: string | null;
  price: number | null;
  currencyCode: string | null;
  availabilityStatus: AdventureAvailabilityStatus;
}

export interface AdventureDay {
  date: string;
  position: number;
  items: AdventureRecommendation[];
}

export interface AdventurePlanPreview {
  normalizedCriteria: AdventureCriteria;
  days: AdventureDay[];
  warnings: string[];
  relaxations: { constraint: string; reasonCode: string }[];
  noResultsReason: string | null;
}

export interface AdventurePlanDetail {
  id: string;
  criteria: AdventureCriteria;
  days: AdventureDay[];
  createdAt: string;
  updatedAt: string;
}

export interface AdventurePlanSummary {
  id: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  partyType: AdventurePartyType;
  budgetTier: AdventureBudgetTier | null;
  minimumAmount: number | null;
  maximumAmount: number | null;
  currencyCode: string | null;
  itemCount: number;
  createdAt: string;
}

export interface AdventureSkipResponse {
  skippedRecommendationId: string;
  replacement: AdventureRecommendation | null;
  reasonCode: string | null;
}

export type AdventurePlanPage = SpringPage<AdventurePlanSummary>;
