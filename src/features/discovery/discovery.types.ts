export type DiscoveryType = 'DESTINATION' | 'PLACE' | 'EXPERIENCE' | 'EVENT' | 'CONTENT' | 'ARTWORK' | 'ARTISAN' | 'CULTURE' | 'LANGUAGE' | 'TRADITION';
export interface DiscoveryItem { id: string; sourceId: string; type: DiscoveryType; title: string; description: string | null; categoryCode: string | null; regionCode: string | null; city: string | null; countryCode: string | null; languageCodes: string | null; artisanId: string | null; verificationStatus: string | null; availabilityStatus: string | null; priceMin: string | number | null; priceMax: string | number | null; }
export interface DiscoveryPage { page: number; size: number; hasNext: boolean; items: DiscoveryItem[]; generatedAt: string; }

export interface DiscoverySearchParams {
  q?: string;
  type?: DiscoveryType;
  categoryCode?: string;
  regionCode?: string;
  countryCode?: string;
  adminLevel1Id?: string;
  cityId?: string;
  languageCode?: string;
  cultureType?: string;
  availability?: boolean;
  verified?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}
