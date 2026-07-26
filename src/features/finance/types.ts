export type FinancePeriod = '7D' | '30D' | '3M';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
export type TransactionType = 'TICKET_SALE' | 'RESERVATION' | 'REFUND' | 'COMMISSION';

export interface FinanceSummary {
  estimatedBalance: number;
  revenue: number;
  yeyamoCommissions: number;
  refunds: number;
  currency: string;
}

export interface FinanceTransaction {
  id: string; type: TransactionType; reference: string; eventName: string; amount: number;
  grossAmount: number; yeyamoCommission: number; netAmount: number; date: string; currency: string; status: TransactionStatus;
}

export interface FinanceDashboard { summary: FinanceSummary; transactions: FinanceTransaction[] }
