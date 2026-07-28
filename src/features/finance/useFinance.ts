import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { usePartnerProfile } from '@/features/partner-dashboard/usePartnerDashboard';
import { financeApi, type FinanceFilters } from './finance.api';
import type { FinancePeriod } from './types';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const financeKeys = {
  all: ['partner', 'finance'] as const,
  summary: (filters: FinanceFilters) => [...financeKeys.all, 'summary', filters] as const,
  transactions: (filters: FinanceFilters) => [...financeKeys.all, 'transactions', filters] as const,
  detail: (partnerId: string, id: string) => [...financeKeys.all, 'transaction', partnerId, id] as const,
};

function periodFilters(partnerId: string, value: FinancePeriod | Omit<FinanceFilters, 'partnerId'>): FinanceFilters {
  if (typeof value !== 'string') return { partnerId, currency: 'XAF', ...value };
  const days = value === '7D' ? 7 : value === '30D' ? 30 : 90;
  return { partnerId, currency: 'XAF', from: new Date(Date.now() - days * 86_400_000).toISOString() };
}

export function useFinanceSummary(filters: FinancePeriod | Omit<FinanceFilters, 'partnerId'>) {
  const profile = usePartnerProfile(); const resolved = periodFilters(profile.data?.id ?? '', filters);
  return useQuery({ queryKey: financeKeys.summary(resolved), queryFn: () => financeApi.getFinanceSummary(resolved), enabled: FEATURE_FLAGS.partner_finance_enabled && Boolean(profile.data?.id), staleTime: 30_000 });
}
export function usePartnerTransactions(filters: FinancePeriod | Omit<FinanceFilters, 'partnerId'>) {
  const profile = usePartnerProfile(); const resolved = periodFilters(profile.data?.id ?? '', filters);
  return useInfiniteQuery({ queryKey: financeKeys.transactions(resolved), initialPageParam: 0, queryFn: ({ pageParam }) => financeApi.getTransactions({ ...resolved, page: pageParam, size: resolved.size ?? 20 }), getNextPageParam: (last) => last.last ? undefined : last.number + 1, enabled: FEATURE_FLAGS.partner_finance_enabled && Boolean(profile.data?.id), staleTime: 15_000 });
}
export function usePartnerTransaction(id: string) {
  const profile = usePartnerProfile();
  return useQuery({ queryKey: financeKeys.detail(profile.data?.id ?? '', id), queryFn: () => financeApi.getTransaction(profile.data!.id, id), enabled: FEATURE_FLAGS.partner_finance_enabled && Boolean(profile.data?.id && id) });
}
export const useFinanceTransaction = usePartnerTransaction;
