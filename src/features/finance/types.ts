export type FinancePeriod = '7D' | '30D' | '3M';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
export type TransactionType = 'TICKET_SALE' | 'RESERVATION' | 'REFUND' | 'COMMISSION';
export type FinanceTransactionType = 'SALE_CREDIT' | 'PLATFORM_COMMISSION' | 'REFUND_DEBIT' | 'ADJUSTMENT' | 'PAYOUT' | 'CHARGEBACK';
/** The ledger has no status field; refund/order statuses are separate backend concepts. */
export type FinanceTransactionStatus = string;

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

export interface LedgerEntry {
  id: string; partnerId: string; orderId: string | null;
  transactionType: FinanceTransactionType; amount: number; currency: string;
  reference: string; idempotencyKey: string; occurredAt: string;
  createdBy: string; reason: string;
}
export interface LedgerBalance {
  partnerId: string; currency: string; balance: number;
}
export interface PartnerFinanceSummary {
  balance: number;
  grossRevenue: number;
  commissions: number;
  refunds: number;
  netRevenue: number;
  currency: string;
}
export interface CommissionRule {
  id: string; partnerId: string | null;
  productType: 'TICKET_ORDER' | 'BOOKING_ORDER' | 'CAMPAIGN_CREDIT_ORDER' | 'EXPERIENCE_ORDER' | 'PARTNER_SUBSCRIPTION';
  percentage: number; fixedAmount: number; maximumAmount: number | null;
  currency: string; ruleVersion: number; effectiveFrom: string;
  effectiveUntil: string | null; status: string; createdAt: string;
}
export interface CommerceRefund {
  id: string; orderId: string; amount: number; status: string;
  idempotencyKey: string; paymentRefundId: string | null; reason: string;
  createdAt: string; completedAt: string | null;
}
