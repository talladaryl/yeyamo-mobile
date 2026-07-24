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
  preferredRegionId: number | null;
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

export const settingsApi = {
  getProfile: () => apiGet<BackendUserProfile>('/users/me'),
  updateProfile: (profile: UpdateBackendProfile) =>
    apiPut<BackendUserProfile>('/users/me', profile),
  updatePreferences: (input: {
    notificationsEnabled: boolean;
    locationSharingEnabled: boolean;
    preferredRegionId: number | null;
  }) => apiPatch<BackendUserProfile>('/users/me/preferences', input),
  deleteAccount: () => apiDelete<void>('/users/me'),
};
