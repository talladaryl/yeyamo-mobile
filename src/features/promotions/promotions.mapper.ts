import type { CreatePromotionRequest, DiscountType, PromotionApplication } from './types';

export interface PromotionFormValues {
  name: string; code: string; description: string; discountType: DiscountType; value: string;
  maximumDiscount: string; minimumOrder: string; startsAt: string; endsAt: string;
  globalLimit: string; userLimit: string; applications: PromotionApplication[];
}

export function promotionFormToCreateRequest(form: PromotionFormValues, partnerId: string): CreatePromotionRequest {
  return {
    partnerId,
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    discountType: form.discountType,
    discountValue: Number(form.value),
    maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : null,
    minimumOrderAmount: Number(form.minimumOrder),
    usageLimit: Number(form.globalLimit),
    usageLimitPerUser: Number(form.userLimit),
    startsAt: new Date(`${form.startsAt}T00:00:00Z`).toISOString(),
    endsAt: new Date(`${form.endsAt}T23:59:59Z`).toISOString(),
    applicableProductTypes: form.applications.map((value) => value === 'TICKETS' ? 'TICKET_ORDER' : value === 'RESERVATIONS' ? 'BOOKING_ORDER' : 'EXPERIENCE_ORDER'),
    applicableEntityIds: [],
  };
}
