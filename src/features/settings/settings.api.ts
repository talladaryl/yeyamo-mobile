import { apiDelete, apiGet, apiPatch, apiPut } from '@/services/api/client';

export interface BackendUserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  language: 'FR' | 'EN';
  visibility: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
  status: string;
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  preferredRegionId: string | null;
  countryCode: string | null;
  adminLevel1Id: string | null;
  adminLevel2Id: string | null;
  cityId: string | null;
  localityId: string | null;
  preferredLanguageCode: string | null;
  timezone: string | null;
  preferredCurrencyCode: string | null;
  contentCountries: string[];
  contentLanguages: string[];
  localRadiusKm: number | null;
  discoverAfricanContent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBackendProfile {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  language: 'FR' | 'EN';
  visibility: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
}

export interface UpdateBackendLocation {
  countryCode: string;
  adminLevel1Id?: string | null;
  adminLevel2Id?: string | null;
  cityId?: string | null;
  localityId?: string | null;
  timezone?: string | null;
}

export const settingsApi = {
  getProfile: () => apiGet<BackendUserProfile>('/users/me'),
  updateProfile: (profile: UpdateBackendProfile) =>
    apiPut<BackendUserProfile>('/users/me', profile),
  updatePreferences: (input: {
    notificationsEnabled: boolean;
    locationSharingEnabled: boolean;
    preferredRegionId: string | null;
  }) => apiPatch<BackendUserProfile>('/users/me/preferences', input),
  updateLocation: (input: UpdateBackendLocation) =>
    apiPatch<BackendUserProfile>('/users/me/location', input),
  deleteAccount: () => apiDelete<void>('/users/me'),
};
