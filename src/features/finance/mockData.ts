import type { FinanceDashboard } from './types';
export const mockFinanceDashboard: FinanceDashboard = {
  summary: { estimatedBalance: 2845000, revenue: 4230000, yeyamoCommissions: 338400, refunds: 156000, currency: 'FCFA' },
  transactions: [
    { id: 'tx-1', type: 'TICKET_SALE', reference: 'TX-2026-00841', eventName: 'Concert Live à Douala', amount: 35000, grossAmount: 35000, yeyamoCommission: 2800, netAmount: 32200, date: '2026-07-25T18:42:00Z', currency: 'FCFA', status: 'COMPLETED' },
    { id: 'tx-2', type: 'RESERVATION', reference: 'TX-2026-00817', eventName: 'Brunch panoramique', amount: 50000, grossAmount: 50000, yeyamoCommission: 4000, netAmount: 46000, date: '2026-07-24T11:20:00Z', currency: 'FCFA', status: 'PENDING' },
    { id: 'tx-3', type: 'REFUND', reference: 'RF-2026-00112', eventName: 'Week-end bien-être', amount: -25000, grossAmount: 25000, yeyamoCommission: 0, netAmount: -25000, date: '2026-07-21T09:10:00Z', currency: 'FCFA', status: 'REFUNDED' },
  ],
};
