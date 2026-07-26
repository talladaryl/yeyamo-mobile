import { apiGet } from '@/services/api/client';
import type { FinanceDashboard, FinancePeriod, FinanceTransaction } from './types';
export const financeApi = {
  dashboard: (period: FinancePeriod) => apiGet<FinanceDashboard>('/partners/me/finance', { params: { period } }),
  summary: (period: FinancePeriod) => apiGet<FinanceDashboard['summary']>('/partners/me/finance/summary', { params: { period } }),
  transactions: (period: FinancePeriod) => apiGet<FinanceTransaction[]>('/partners/me/finance/transactions', { params: { period } }),
  transaction: (id: string) => apiGet<FinanceTransaction>(`/partners/me/finance/transactions/${id}`),
};
