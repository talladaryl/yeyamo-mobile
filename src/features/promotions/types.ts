export type PromotionStatus = 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE_FEE';
export type PromotionApplication = 'TICKETS' | 'RESERVATIONS' | 'EXPERIENCES';

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
