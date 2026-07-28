import { apiGet } from '@/services/api/client';
import type { LedgerEntry, PartnerFinanceSummary } from './types';
import type { SpringPage } from '@/services/api/contracts';

export interface FinanceFilters { partnerId: string; currency?: string; from?: string; to?: string; page?: number; size?: number }
const base = (partnerId: string) => `/commerce/partners/${partnerId}/finance`;
const params = ({ partnerId: _partnerId, ...filters }: FinanceFilters) => filters;

export const financeApi = {
  getFinanceSummary: (filters: FinanceFilters) => apiGet<PartnerFinanceSummary>(`${base(filters.partnerId)}/summary`, { params: params(filters) }),
  getTransactions: (filters: FinanceFilters) => apiGet<SpringPage<LedgerEntry>>(`${base(filters.partnerId)}/transactions`, { params: params(filters) }),
  getTransaction: (partnerId: string, id: string) => apiGet<LedgerEntry>(`${base(partnerId)}/transactions/${id}`),
};
