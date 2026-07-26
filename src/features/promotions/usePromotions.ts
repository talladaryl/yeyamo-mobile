import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { mockPromotions } from './mockData';
import { promotionsApi } from './promotions.api';
import type { CreatePromotionInput, Promotion, PromotionStatus } from './types';

export const promotionKeys = {
  all: ['partner', 'promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list: (status: PromotionStatus) => [...promotionKeys.lists(), status] as const,
};
function useDemo() { return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); }

export function usePromotions(status: PromotionStatus) {
  const isDemo = useDemo();
  return useQuery({ queryKey: promotionKeys.list(status), queryFn: () => !isDemo ? promotionsApi.list(status) : Promise.resolve(mockPromotions.filter((item) => item.status === status)) });
}
export const usePartnerPromotions = usePromotions;

export function useCreatePromotion() {
  const client = useQueryClient(); const isDemo = useDemo();
  return useMutation({
    mutationFn: async (input: CreatePromotionInput) => {
      if (!isDemo) return promotionsApi.create(input);
      const promotion: Promotion = { id: `promo-${Date.now()}`, name: input.name, code: input.code, description: input.description, discountType: input.discountType, value: input.value, startsAt: input.startsAt, endsAt: input.endsAt, usageCount: 0, globalLimit: input.globalLimit, status: new Date(input.startsAt) > new Date() ? 'SCHEDULED' : 'ACTIVE', applications: input.applications };
      mockPromotions.push(promotion); return promotion;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: promotionKeys.lists() }),
  });
}
