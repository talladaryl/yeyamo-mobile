export type PromotedEntityType = 'PLACE' | 'EVENT' | 'POST' | 'PARTNER_PROFILE' | 'EXPERIENCE';

export interface AdSelectionRequest {
  userId: string | null;
  anonymousSessionId: string | null;
  placement: string;
  countryCode: string;
  regionId: string | null;
  cityId: string | null;
  districtId: string | null;
  latitude: number | null;
  longitude: number | null;
  interestIds: string[] | null;
  ageBand: string | null;
  language: string;
  deviceType: string;
  requestTimestamp: string;
  contextEntityType: string | null;
  contextEntityId: string | null;
  excludedCampaignIds: string[] | null;
  limit: number | null;
}

export interface SponsoredPlacement {
  deliveryId: string;
  campaignId: string;
  promotedEntityType: PromotedEntityType;
  promotedEntityId: string;
  placement: string;
  creative: Record<string, unknown>;
  disclosureLabel: string;
  reasonCodes: string[];
  impressionTrackingToken: string;
  clickTrackingToken: string;
  expiresAt: string;
  rankPosition: number;
  deliveryPolicyVersion: string;
}

export interface ImpressionRequest {
  impressionToken: string;
  viewedAt: string;
  viewDurationMs: number | null;
}

export interface ClickRequest {
  clickToken: string;
  clickedAt: string;
}

export interface ConversionRequest {
  deliveryId: string;
  convertedAt: string;
  conversionType: string;
  conversionValue: number | null;
}
