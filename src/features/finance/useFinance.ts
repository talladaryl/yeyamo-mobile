import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { financeApi } from './finance.api';
import { mockFinanceDashboard } from './mockData';
import type { FinancePeriod } from './types';

export const financeKeys = {
  all: ['partner', 'finance'] as const,
  dashboard: (period: FinancePeriod) => [...financeKeys.all, 'dashboard', period] as const,
  summary: (period: FinancePeriod) => [...financeKeys.all, 'summary', period] as const,
  transactions: (period: FinancePeriod) => [...financeKeys.all, 'transactions', period] as const,
  detail: (id: string) => [...financeKeys.all, 'transaction', id] as const,
};
function useDemo() { return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); }

export function useFinanceSummary(period: FinancePeriod) {
  const isDemo = useDemo();
  return useQuery({ queryKey: financeKeys.summary(period), queryFn: () => !isDemo ? financeApi.summary(period) : Promise.resolve(mockFinanceDashboard.summary) });
}
export function usePartnerTransactions(period: FinancePeriod) {
  const isDemo = useDemo();
  return useQuery({ queryKey: financeKeys.transactions(period), queryFn: () => !isDemo ? financeApi.transactions(period) : Promise.resolve(mockFinanceDashboard.transactions) });
}
export function usePartnerFinance(period: FinancePeriod) {
  const isDemo = useDemo();
  return useQuery({ queryKey: financeKeys.dashboard(period), queryFn: () => !isDemo ? financeApi.dashboard(period) : Promise.resolve(mockFinanceDashboard) });
}
export function useFinanceTransaction(id: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: financeKeys.detail(id), queryFn: async () => { if (!isDemo) return financeApi.transaction(id); const item = mockFinanceDashboard.transactions.find((transaction) => transaction.id === id); if (!item) throw new Error('Transaction introuvable'); return item; }, enabled: Boolean(id) });
}
