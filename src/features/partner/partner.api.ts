import { apiGet, apiPost } from '@/services/api/client';

export type PartnerBusinessType =
  | 'INDIVIDUAL'
  | 'COMPANY'
  | 'ASSOCIATION'
  | 'PUBLIC_ORGANIZATION'
  | 'BUSINESS'
  | 'ARTISAN'
  | 'ARTIST'
  | 'CULTURAL_ASSOCIATION'
  | 'MUSEUM'
  | 'CULTURAL_EXPERT'
  | 'TOURISM_OPERATOR';

export interface Partner {
  id: string;
  legalName: string;
  tradeName: string | null;
  businessType: PartnerBusinessType;
  contactEmail: string;
  contactPhone: string | null;
  primaryCountryCode: string | null;
  operatingCountries: string[];
  status: string;
}

export interface CreatePartnerInput {
  legalName: string;
  tradeName?: string;
  businessType: PartnerBusinessType;
  contactEmail: string;
  contactPhone?: string;
  description?: string;
  primaryCountryCode: string;
  operatingCountries: string[];
}

export const partnerApi = {
  me: () => apiGet<Partner>('/partners/me'),
  create: (input: CreatePartnerInput) => apiPost<Partner>('/partners', input),
};
