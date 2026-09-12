import { apiGet, apiPost, apiPut } from '@/services/api/client';

export interface PartnerProfile {
  id: string;
  legalName: string;
  tradeName: string | null;
  businessType: string;
  registrationNumber: string | null;
  taxId: string | null;
  contactEmail: string;
  contactPhone: string | null;
  websiteUrl: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerAnalyticsPoint {
  partnerId: string;
  statDate: string;
  totalViews: number;
  totalBookings: number;
  totalReviews: number;
  avgRating: number;
  grossBookingValue: number;
  totalCheckIns: number;
}

export interface ArtisanAnalytics {
  artisanId: string;
  period: { days: number; from: string; to: string };
  dataAvailable: boolean;
  totalSales: number | null;
  revenue: number | null;
  totalViews: number | null;
  newFollowers: number | null;
  dailyKpis: Array<{
    date: string;
    sales: number | null;
    revenue: number | null;
    totalViews: number | null;
    newFollowers: number | null;
    engagementRate: number | null;
    reachCountries: number | null;
  }>;
}

export interface CreatePartnerInput {
  legalName: string;
  tradeName: string | null;
  businessType: string;
  registrationNumber: string | null;
  taxId: string | null;
  contactEmail: string;
  contactPhone: string | null;
  websiteUrl: string | null;
  description: string | null;
}

export const partnerApi = {
  me: () => apiGet<PartnerProfile>('/partners/me'),
  create: (input: CreatePartnerInput) => apiPost<PartnerProfile>('/partners', input),
  update: (input: CreatePartnerInput) => apiPut<PartnerProfile>('/partners/me', input),
  submit: () => apiPost<PartnerProfile>('/partners/me/submit'),
  analytics: (partnerId: string) =>
    apiGet<PartnerAnalyticsPoint[]>(`/analytics/partners/${partnerId}/dashboard`),
  artisanAnalytics: (periodDays: 7 | 30 | 90) =>
    apiGet<ArtisanAnalytics>(`/analytics/artisans/me?periodDays=${periodDays}`),
};
