import type { DiscoveryItem, DiscoveryType } from '@/features/discovery/discovery.types';

export type RecommendationKind = DiscoveryType;

export interface RecommendationItem {
  targetId: string;
  kind: RecommendationKind;
  title: string;
  categoryCode: string | null;
  regionCode: string | null;
  latitude: number | null;
  longitude: number | null;
  score: { total: number; components: Record<string, number> };
}

export interface RecommendationPage {
  page: number;
  size: number;
  hasNext: boolean;
  items: RecommendationItem[];
  generatedAt: string;
}

export interface RecommendationRequest {
  latitude?: number;
  longitude?: number;
  languageCodes?: string[];
  context?: string;
  page?: number;
  size?: number;
}

/** Reuse the existing discovery cards and detail routing without fabricating data. */
export function recommendationAsDiscoveryItem(item: RecommendationItem): DiscoveryItem {
  return {
    id: `recommendation:${item.kind}:${item.targetId}`,
    sourceId: `${item.kind.toLowerCase()}:${item.targetId}`,
    type: item.kind,
    title: item.title,
    description: item.categoryCode,
    categoryCode: item.categoryCode,
    regionCode: item.regionCode,
    city: null,
    // The current recommendation contract does not return a country.  Do not
    // infer one on the client: the backend profile filters it server-side.
    countryCode: null,
    languageCodes: null,
    artisanId: item.kind === 'ARTISAN' ? item.targetId : null,
    verificationStatus: null,
    availabilityStatus: null,
    priceMin: null,
    priceMax: null,
  };
}
