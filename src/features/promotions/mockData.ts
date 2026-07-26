import type { Promotion } from './types';
export const mockPromotions: Promotion[] = [
  { id: 'promo-1', name: 'Bienvenue été', code: 'ETE20', description: 'Offre estivale', discountType: 'PERCENTAGE', value: 20, startsAt: '2026-07-01', endsAt: '2026-08-31', usageCount: 86, globalLimit: 250, status: 'ACTIVE', applications: ['TICKETS', 'RESERVATIONS'] },
  { id: 'promo-2', name: 'Rentrée VIP', code: 'VIP5000', description: 'Réduction VIP', discountType: 'FIXED_AMOUNT', value: 5000, startsAt: '2026-09-01', endsAt: '2026-09-30', usageCount: 0, globalLimit: 100, status: 'SCHEDULED', applications: ['TICKETS'] },
  { id: 'promo-3', name: 'Week-end découverte', code: 'DECOUVERTE', description: 'Ancienne offre', discountType: 'FREE_SERVICE_FEE', value: 0, startsAt: '2026-05-01', endsAt: '2026-05-31', usageCount: 120, globalLimit: 120, status: 'COMPLETED', applications: ['EXPERIENCES'] },
];
