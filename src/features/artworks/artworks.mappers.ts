import type { SpringPage } from '@/services/api/contracts';
import { absoluteApiUrl } from '@/services/api/contracts';
import type { Artwork, ArtworkDetail, ArtworkMedia } from './artworks.types';

export interface ArtworkApiDto {
  id?: string; assetId?: string; artisanId?: string; artisanPartnerId?: string;
  title: string; slug: string; shortDescription: string | null; story?: string | null;
  countryCode: string; adminLevel1Id?: string | null; cityId: string | null; localityId?: string | null;
  cultureContentId?: string | null; culturalCommunity: string | null; yearCreated: number | null;
  productionTime?: string | null; width?: string | number | null; height?: string | number | null;
  depth?: string | number | null; weight?: string | number | null; editionType: string;
  editionSize?: number | null; availabilityStatus: Artwork['availabilityStatus']; authenticityStatus: string;
  media?: { artworkId?: string; id?: string; mediaId?: string; type?: ArtworkMedia['mediaType']; mediaType?: ArtworkMedia['mediaType']; displayOrder: number; contentUrl?: string; url?: string }[];
  createdAt: string; updatedAt?: string;
}

export function mapArtwork(dto: ArtworkApiDto): Artwork {
  const assetId = dto.assetId ?? dto.id;
  const artisanPartnerId = dto.artisanPartnerId ?? dto.artisanId;
  if (!assetId || !artisanPartnerId) throw new Error('ARTWORK_CONTRACT_MISSING_ID');
  const primary = [...(dto.media ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)[0];
  return {
    assetId, artisanPartnerId, title: dto.title, slug: dto.slug,
    shortDescription: dto.shortDescription, story: dto.story ?? null,
    countryCode: dto.countryCode, adminLevel1Id: dto.adminLevel1Id ?? null,
    cityId: dto.cityId, localityId: dto.localityId ?? null,
    cultureContentId: dto.cultureContentId ?? null, culturalCommunity: dto.culturalCommunity,
    yearCreated: dto.yearCreated, productionTime: dto.productionTime ?? null,
    width: dto.width ?? null, height: dto.height ?? null, depth: dto.depth ?? null, weight: dto.weight ?? null,
    editionType: dto.editionType, editionSize: dto.editionSize ?? null,
    availabilityStatus: dto.availabilityStatus, authenticityStatus: dto.authenticityStatus,
    imageUrl: primary?.contentUrl || primary?.url ? absoluteApiUrl(primary.contentUrl ?? primary.url) ?? undefined : undefined,
    createdAt: dto.createdAt, updatedAt: dto.updatedAt ?? dto.createdAt,
  };
}

export function mapArtworkPage(page: SpringPage<ArtworkApiDto>): SpringPage<Artwork> {
  return { ...page, content: page.content.map(mapArtwork) };
}

export function mapArtworkDetail(dto: ArtworkApiDto): ArtworkDetail {
  const artwork = mapArtwork(dto);
  const media: ArtworkMedia[] = (dto.media ?? []).flatMap((item) => {
    const mediaId = item.mediaId ?? item.id;
    const mediaType = item.mediaType ?? item.type;
    if (!mediaId || !mediaType) return [];
    return [{
    artworkId: item.artworkId ?? artwork.assetId,
    mediaId,
    mediaType,
    displayOrder: item.displayOrder,
    }];
  });
  return { artwork, translations: [], media };
}
export function primaryArtworkMedia(media: ArtworkMedia[]): ArtworkMedia | undefined { return [...media].sort((a, b) => a.displayOrder - b.displayOrder).find((item) => item.mediaType === 'PRIMARY_IMAGE') ?? media[0]; }
export function dimensions(artwork: Artwork): string | null { const values = [artwork.width, artwork.height, artwork.depth].filter((value) => value !== null && value !== undefined); return values.length ? `${values.join(' × ')} cm` : null; }
