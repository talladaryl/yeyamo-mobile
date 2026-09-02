import type { SpringPage } from '@/services/api/contracts';

export type ArtworkAvailability = 'DISPLAY_ONLY' | 'AVAILABLE' | 'ON_ORDER' | 'RESERVED' | 'SOLD' | 'UNAVAILABLE';
export interface Artwork { assetId: string; artisanPartnerId: string; title: string; slug: string; shortDescription: string | null; story: string | null; countryCode: string; adminLevel1Id: string | null; cityId: string | null; localityId: string | null; cultureContentId: string | null; culturalCommunity: string | null; yearCreated: number | null; productionTime: string | null; width: string | number | null; height: string | number | null; depth: string | number | null; weight: string | number | null; editionType: string; editionSize: number | null; availabilityStatus: ArtworkAvailability; authenticityStatus: string; createdAt: string; updatedAt: string; category?: string; imageUrl?: string; audioUrl?: string; materials?: string[]; workshopLocation?: string; }
export interface ArtworkMedia { artworkId: string; mediaId: string; mediaType: 'PRIMARY_IMAGE' | 'GALLERY_IMAGE' | 'VIDEO' | 'CREATION_PROCESS' | 'ARTISAN_AUDIO' | 'HISTORY_AUDIO' | 'CERTIFICATE'; displayOrder: number; }
export interface ArtworkTranslation { id: string; artworkId: string; languageCode: string; title: string; shortDescription: string | null; story: string | null; status: string; translatorId: string | null; }
export interface ArtworkHistory { id: string; artworkId: string; title: string; narrative: string; languageCode: string; period: string | null; culturalMeaning: string | null; source: string | null; contributorId: string | null; verificationStatus: string; createdAt: string; }
export interface ArtworkDetail { artwork: Artwork; translations: ArtworkTranslation[]; media: ArtworkMedia[]; }
export interface ArtworkOffer { id: string; artworkId: string; artisanPartnerId: string; saleType: 'FIXED_PRICE' | 'ON_REQUEST' | 'CUSTOM_ORDER' | 'AUCTION_FUTURE'; amount: string | number | null; currencyCode: string | null; availableQuantity: number; reservedQuantity: number; countryCode: string; internationalShipping: boolean; customOrderAllowed: boolean; status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'DISABLED'; }
export interface ArtworkFilters { countryCode?: string; artisanId?: string; availability?: ArtworkAvailability; search?: string; page?: number; size?: number; }
export type ArtworkPage = SpringPage<Artwork>;

export interface ArtworkRequest {
  artisanPartnerId: string; title: string; slug?: string; shortDescription?: string; story?: string;
  countryCode: string; adminLevel1Id?: string; cityId?: string; localityId?: string; cultureContentId?: string;
  culturalCommunity?: string; yearCreated?: number; productionTime?: string;
  width?: string; height?: string; depth?: string; weight?: string;
  editionType: string; editionSize?: number; availabilityStatus: ArtworkAvailability;
  translations?: { languageCode: string; title: string; shortDescription?: string; story?: string; status?: string; translatorId?: string }[];
  mediaIds: { mediaId: string; type: ArtworkMedia['mediaType']; displayOrder: number }[];
}

export interface ArtworkOfferInput {
  artworkId: string; artisanPartnerId: string; saleType: ArtworkOffer['saleType']; amount?: string | number | null;
  currencyCode?: string | null; availableQuantity: number; countryCode: string; internationalShipping: boolean;
  customOrderAllowed: boolean; status: ArtworkOffer['status'];
}
