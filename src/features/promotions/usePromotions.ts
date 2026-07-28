import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePartnerProfile } from '@/features/partner-dashboard/usePartnerDashboard';
import { promotionsApi, type PromotionFilters } from './promotions.api';
import type { CreatePromotionInput, CreatePromotionRequest, Promotion, PromotionApiStatus, PromotionStatus } from './types';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const promotionKeys = {
  all: ['promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list: (filters: PromotionFilters) => [...promotionKeys.lists(), filters] as const,
  details: () => [...promotionKeys.all, 'detail'] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
};

export function usePromotions(filters: PromotionFilters = {}) {
  return useQuery({
    queryKey: promotionKeys.list(filters),
    queryFn: () => promotionsApi.getPromotions(filters),
    staleTime: 30_000,
    enabled: FEATURE_FLAGS.promotions_enabled,
  });
}

export function usePromotion(id?: string) {
  return useQuery({
    queryKey: promotionKeys.detail(id ?? ''),
    queryFn: () => promotionsApi.getPromotion(id!),
    enabled: FEATURE_FLAGS.promotions_enabled && Boolean(id),
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  const profile = usePartnerProfile();
  return useMutation({
    mutationFn: (payload: CreatePromotionRequest | CreatePromotionInput) => FEATURE_FLAGS.promotions_enabled ? promotionsApi.createPromotion(
      'discountValue' in payload ? payload : legacyCreateRequest(payload, profile.data?.id ?? null),
    ) : Promise.reject({ code: 'FEATURE_DISABLED', message: 'Les promotions sont désactivées.' }),
    onSuccess: (promotion) => {
      queryClient.setQueryData(promotionKeys.detail(promotion.id), promotion);
      return queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePromotionRequest }) =>
      promotionsApi.updatePromotion(id, payload),
    onSuccess: (promotion) => {
      queryClient.setQueryData(promotionKeys.detail(promotion.id), promotion);
      return queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

export function useDisablePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.disablePromotion(id),
    onSuccess: (promotion) => {
      queryClient.setQueryData(promotionKeys.detail(promotion.id), promotion);
      return queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

export function usePartnerPromotions(status: PromotionStatus) {
  const profile = usePartnerProfile();
  const apiStatus: PromotionApiStatus | undefined = status === 'ACTIVE' ? 'ACTIVE' : undefined;
  return useQuery({
    queryKey: promotionKeys.list({ partnerId: profile.data?.id, status: apiStatus, size: 50, displayStatus: status } as PromotionFilters & { displayStatus: PromotionStatus }),
    enabled: FEATURE_FLAGS.promotions_enabled && Boolean(profile.data?.id),
    queryFn: async (): Promise<Promotion[]> => {
      const page = await promotionsApi.getPromotions({ partnerId: profile.data!.id, status: apiStatus, size: 50 });
      return page.content.map(toLegacyPromotion).filter((promotion) => promotion.status === status);
    },
  });
}

function legacyCreateRequest(input: CreatePromotionInput, partnerId: string | null): CreatePromotionRequest {
  const productTypes = input.applications.map((application) => application === 'TICKETS' ? 'TICKET_ORDER' : application === 'RESERVATIONS' ? 'BOOKING_ORDER' : 'EXPERIENCE_ORDER');
  return { partnerId, code: input.code, name: input.name, description: input.description || null, discountType: input.discountType, discountValue: input.value, maximumDiscount: input.maximumDiscount, minimumOrderAmount: input.minimumOrder, usageLimit: input.globalLimit, usageLimitPerUser: input.userLimit, startsAt: new Date(`${input.startsAt}T00:00:00Z`).toISOString(), endsAt: new Date(`${input.endsAt}T23:59:59Z`).toISOString(), applicableProductTypes: productTypes, applicableEntityIds: [] };
}

function toLegacyPromotion(promotion: import('./types').PromotionResponse): Promotion {
  const now = Date.now();
  const status: PromotionStatus = promotion.status === 'ACTIVE' && Date.parse(promotion.startsAt) > now ? 'SCHEDULED' : promotion.status === 'ACTIVE' && Date.parse(promotion.endsAt) >= now ? 'ACTIVE' : 'COMPLETED';
  const products = promotion.applicableProductTypes.split(',');
  return { id: promotion.id, name: promotion.name, code: promotion.code, description: promotion.description ?? '', discountType: promotion.discountType, value: promotion.discountValue, startsAt: promotion.startsAt, endsAt: promotion.endsAt, usageCount: promotion.usageCount, globalLimit: promotion.usageLimit ?? 0, status, applications: products.map((product) => product === 'TICKET_ORDER' ? 'TICKETS' : product === 'BOOKING_ORDER' ? 'RESERVATIONS' : 'EXPERIENCES') };
}
