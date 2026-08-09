import type { SpringPage } from '@/services/api/contracts';
export interface ArtisanSpecialty { id: string; code: string; name: string; description: string | null; }
export interface Artisan { partnerId: string; displayName: string; story: string; craftDescription: string; yearsOfExperience: number | null; countryCode: string; adminLevel1Id: string | null; cityId: string | null; localityId: string | null; languages: string[]; specialties: ArtisanSpecialty[]; acceptsCustomOrders: boolean; internationalShipping: boolean; verificationStatus: string; featured: boolean; createdAt: string; updatedAt: string; }
export interface ArtisanFilters { countryCode?: string; adminLevel1Id?: string; cityId?: string; specialtyId?: string; verified?: boolean; acceptsCustomOrders?: boolean; internationalShipping?: boolean; search?: string; page?: number; size?: number; }
export type ArtisanPage = SpringPage<Artisan>;
