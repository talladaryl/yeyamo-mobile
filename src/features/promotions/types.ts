/** Existing screen filter/view-model states. */
export type PromotionStatus = 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
/** Exact commerce-service PromotionStatus. */
export type PromotionApiStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE_FEE';
export type PromotionApplication = 'TICKETS' | 'RESERVATIONS' | 'EXPERIENCES';
export type CommerceProductType = 'TICKET_ORDER' | 'BOOKING_ORDER' | 'CAMPAIGN_CREDIT_ORDER' | 'EXPERIENCE_ORDER' | 'PARTNER_SUBSCRIPTION';

export interface PromotionResponse {
  id: string; partnerId: string | null; code: string; name: string; description: string | null;
  discountType: DiscountType; discountValue: number; maximumDiscount: number | null;
  minimumOrderAmount: number; usageLimit: number | null; usageLimitPerUser: number | null;
  usageCount: number; startsAt: string; endsAt: string;
  /** Raw JPA entity fields are comma-separated strings in the current API. */
  applicableProductTypes: string; applicableEntityIds: string;
  status: PromotionApiStatus; version: number; createdAt: string; updatedAt: string;
}

export interface CreatePromotionRequest {
  partnerId: string | null; code: string; name: string; description: string | null;
  discountType: DiscountType; discountValue: number; maximumDiscount: number | null;
  minimumOrderAmount: number; usageLimit: number | null; usageLimitPerUser: number | null;
  startsAt: string; endsAt: string; applicableProductTypes: CommerceProductType[];
  applicableEntityIds: string[];
}

export interface Promotion {
  id: string; name: string; code: string; description: string; discountType: DiscountType;
  value: number; startsAt: string; endsAt: string; usageCount: number; globalLimit: number; status: PromotionStatus;
  applications: PromotionApplication[];
}

export interface CreatePromotionInput {
  name: string; code: string; description: string; discountType: DiscountType; value: number;
  maximumDiscount: number | null; minimumOrder: number; startsAt: string; endsAt: string;
  globalLimit: number; userLimit: number; applications: PromotionApplication[];
}
