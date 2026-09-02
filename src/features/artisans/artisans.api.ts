import { apiGet, apiPost } from '@/services/api/client';
import type { SpringPage } from '@/services/api/contracts';
import type { Artisan, ArtisanFilters, ArtisanSpecialty } from './artisans.types';

const params = <T extends object>(values: T) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''));

export const artisansApi = {
  list: (filters: ArtisanFilters) => apiGet<SpringPage<Artisan>>('/artisans', { params: params(filters) }),
  detail: (id: string) => apiGet<Artisan>(`/artisans/${id}/profile`),
  specialties: () => apiGet<ArtisanSpecialty[]>('/artisan-specialties'),
  myProfile: () => apiGet<Artisan>('/partners/me/artisan-profile'),
  createMyProfile: (input: ArtisanProfileInput) => apiPost<Artisan>('/partners/me/artisan-profile', input),
};

export interface ArtisanProfileInput { displayName: string; story: string; craftDescription: string; yearsOfExperience?: number; countryCode: string; adminLevel1Id?: string; cityId?: string; localityId?: string; languages: string[]; specialtyIds: string[]; acceptsCustomOrders: boolean; internationalShipping: boolean; artisanType: 'ARTISAN' | 'ARTIST'; }
