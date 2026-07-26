import type { AnalyticsPeriod, Campaign, CampaignAnalytics } from './types';

export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-summer-falaise',
    name: 'Escapade d’été',
    visualUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900',
    promotedContent: 'La Falaise Resort',
    status: 'ACTIVE',
    totalBudget: 250000,
    amountSpent: 164500,
    impressions: 48230,
    clicks: 2315,
    conversions: 184,
    startsAt: '2026-07-10T00:00:00.000Z',
    endsAt: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'campaign-brunch',
    name: 'Brunch du dimanche',
    visualUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900',
    promotedContent: 'Brunch panoramique',
    status: 'PENDING_REVIEW',
    totalBudget: 90000,
    amountSpent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    startsAt: '2026-08-02T00:00:00.000Z',
    endsAt: '2026-08-30T00:00:00.000Z',
  },
  {
    id: 'campaign-weekend',
    name: 'Week-end bien-être',
    visualUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900',
    promotedContent: 'Forfait spa & nuitée',
    status: 'COMPLETED',
    totalBudget: 150000,
    amountSpent: 148750,
    impressions: 35940,
    clicks: 1784,
    conversions: 121,
    startsAt: '2026-05-01T00:00:00.000Z',
    endsAt: '2026-05-31T00:00:00.000Z',
  },
  {
    id: 'campaign-draft-rooftop',
    name: 'Soirée rooftop',
    visualUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900',
    promotedContent: 'Événement Sunset Rooftop',
    status: 'DRAFT',
    totalBudget: 120000,
    amountSpent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    startsAt: '2026-09-05T00:00:00.000Z',
    endsAt: '2026-09-12T00:00:00.000Z',
  },
];

const analyticsPoints = [
  { label: 'Lun', impressions: 5200, clicks: 246, conversions: 18 },
  { label: 'Mar', impressions: 6800, clicks: 331, conversions: 25 },
  { label: 'Mer', impressions: 5900, clicks: 284, conversions: 21 },
  { label: 'Jeu', impressions: 7700, clicks: 382, conversions: 34 },
  { label: 'Ven', impressions: 8300, clicks: 416, conversions: 37 },
  { label: 'Sam', impressions: 8900, clicks: 438, conversions: 31 },
  { label: 'Dim', impressions: 5430, clicks: 218, conversions: 18 },
];

export function mockCampaignAnalytics(period: AnalyticsPeriod): CampaignAnalytics {
  const multiplier = period === 'ALL' ? 4 : period === '30D' ? 2 : 1;
  return {
    reach: 37420 * multiplier,
    points: analyticsPoints.map((point) => ({
      ...point,
      impressions: point.impressions * multiplier,
      clicks: point.clicks * multiplier,
      conversions: point.conversions * multiplier,
    })),
    cities: [
      { label: 'Douala', percentage: 48 },
      { label: 'Yaoundé', percentage: 31 },
      { label: 'Bafoussam', percentage: 12 },
      { label: 'Autres', percentage: 9 },
    ],
    placements: [
      { label: 'Fil Découvrir', percentage: 56 },
      { label: 'Explorer', percentage: 29 },
      { label: 'Événements', percentage: 15 },
    ],
    devices: [
      { label: 'Android', percentage: 64 },
      { label: 'iOS', percentage: 36 },
    ],
  };
}
