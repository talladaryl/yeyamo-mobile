import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { dashboardMetrics, statisticCards } from './mockData';
import { partnerApi } from './partner.api';
import type { DashboardMetrics, StatisticCard } from './types';

function useDemoPartner() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function usePartnerProfile() {
  const isDemo = useDemoPartner();
  return useQuery({
    queryKey: ['partner', isDemo ? 'demo' : 'backend', 'profile'],
    queryFn: () => isDemo
      ? Promise.resolve({
          id: 'demo-partner',
          legalName: 'La Falaise Resort',
          tradeName: 'La Falaise Resort',
          businessType: 'HOTEL',
          registrationNumber: null,
          taxId: null,
          contactEmail: 'partner.demo@yeyamo.com',
          contactPhone: null,
          websiteUrl: null,
          description: null,
          status: 'VERIFIED',
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
        })
      : partnerApi.me(),
  });
}

export function usePartnerStatistics() {
  const isDemo = useDemoPartner();
  const profile = usePartnerProfile();
  return useQuery({
    queryKey: ['partner', isDemo ? 'demo' : 'backend', 'statistics', profile.data?.id],
    enabled: isDemo || Boolean(profile.data?.id),
    queryFn: async (): Promise<{
      cards: StatisticCard[];
      bars: number[];
      metrics: DashboardMetrics;
    }> => {
      if (isDemo) {
        return { cards: statisticCards, bars: [34, 48, 42, 68, 56, 78, 64, 84], metrics: dashboardMetrics };
      }
      const points = await partnerApi.analytics(profile.data!.id);
      const views = points.map((point) => point.totalViews);
      const maxViews = Math.max(1, ...views);
      const totalViews = views.reduce((sum, value) => sum + value, 0);
      const bookings = points.reduce((sum, point) => sum + point.totalBookings, 0);
      return {
        cards: [
          { label: 'Total des vues', value: String(totalViews), change: '', isPositive: true },
          { label: 'Réservations', value: String(bookings), change: '', isPositive: true },
        ],
        bars: views.slice(-8).map((value) => Math.round((value / maxViews) * 100)),
        metrics: { publications: 0, views: totalViews, establishments: 0 },
      };
    },
  });
}
