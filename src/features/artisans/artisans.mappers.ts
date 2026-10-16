import type { SpringPage } from '@/services/api/contracts';
import type { Artisan, ArtisanSpecialty } from './artisans.types';

export interface ArtisanApiDto {
  id?: string;
  partnerId?: string;
  displayName: string;
  story: string;
  craftDescription: string;
  yearsOfExperience: number | null;
  countryCode: string;
  adminLevel1Id: string | null;
  cityId: string | null;
  localityId: string | null;
  languages: string[];
  specialties: ArtisanSpecialty[];
  acceptsCustomOrders: boolean;
  internationalShipping: boolean;
  verified?: boolean;
  verificationStatus?: string;
  featured?: boolean;
  avatarUrl?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function mapArtisan(dto: ArtisanApiDto): Artisan {
  const partnerId = dto.partnerId ?? dto.id;
  if (!partnerId) throw new Error('ARTISAN_CONTRACT_MISSING_ID');
  return {
    partnerId,
    displayName: dto.displayName,
    story: dto.story,
    craftDescription: dto.craftDescription,
    yearsOfExperience: dto.yearsOfExperience,
    countryCode: dto.countryCode,
    adminLevel1Id: dto.adminLevel1Id,
    cityId: dto.cityId,
    localityId: dto.localityId,
    languages: dto.languages ?? [],
    specialties: dto.specialties ?? [],
    acceptsCustomOrders: dto.acceptsCustomOrders,
    internationalShipping: dto.internationalShipping,
    verificationStatus: dto.verificationStatus ?? (dto.verified === true ? 'VERIFIED' : 'UNVERIFIED'),
    featured: dto.featured,
    avatarUrl: dto.avatarUrl,
    coverImageUrl: dto.coverImageUrl,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapArtisanPage(page: SpringPage<ArtisanApiDto>): SpringPage<Artisan> {
  return { ...page, content: page.content.map(mapArtisan) };
}
