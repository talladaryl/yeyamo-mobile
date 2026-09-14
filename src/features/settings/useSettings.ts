import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { useInterestsStore } from '@/features/interests/interests.store';
import { MOCK_USER_SETTINGS } from './mockData';
import { settingsApi, type BackendUserProfile, type UpdateBackendLocation, type UpdateBackendProfile } from './settings.api';
import type { ProfileSettings } from './types';

function useDemoMode() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

function profileKey(isDemo: boolean) {
  return ['settings', isDemo ? 'demo' : 'backend', 'profile'] as const;
}

function mapProfile(profile: BackendUserProfile, username: string, interests: string[]): ProfileSettings {
  return {
    avatar_url: profile.avatarUrl,
    display_name: profile.displayName,
    username,
    bio: profile.bio,
    country_code: profile.countryCode,
    city_id: profile.cityId,
    timezone: profile.timezone,
    // Interests are an Explorer preference until the profile contract exposes them.
    interests,
  };
}

export function useProfileSettings() {
  const isDemo = useDemoMode();
  const authUser = useAuthStore((state) => state.user);
  const interests = useInterestsStore((state) => state.selectedInterestIds);
  return useQuery({
    queryKey: profileKey(isDemo),
    enabled: Boolean(authUser),
    queryFn: async (): Promise<ProfileSettings> => {
      if (isDemo) return MOCK_USER_SETTINGS.profile;
      return mapProfile(await settingsApi.getProfile(), authUser?.username ?? '', interests);
    },
    placeholderData: isDemo ? MOCK_USER_SETTINGS.profile : undefined,
  });
}

export function useUpdateProfileSettings() {
  const isDemo = useDemoMode();
  const queryClient = useQueryClient();
  const updateAuthUser = useAuthStore((state) => state.updateUser);
  const interests = useInterestsStore((state) => state.selectedInterestIds);
  return useMutation({
    mutationFn: async (profile: ProfileSettings) => {
      if (isDemo) return profile;
      const current = await settingsApi.getProfile();
      const input: UpdateBackendProfile = {
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        language: current.language,
        visibility: current.visibility,
      };
      return mapProfile(await settingsApi.updateProfile(input), profile.username, interests);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKey(isDemo), profile);
      updateAuthUser({ display_name: profile.display_name, avatar_url: profile.avatar_url });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['social'] });
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/** Updates only documented location IDs. It does not invent a text city/region API. */
export function useUpdateProfileLocation() {
  const isDemo = useDemoMode();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const interests = useInterestsStore((state) => state.selectedInterestIds);
  return useMutation({
    mutationFn: async (input: UpdateBackendLocation) => {
      if (isDemo) {
        return { ...MOCK_USER_SETTINGS.profile, country_code: input.countryCode, city_id: input.cityId ?? null, timezone: input.timezone ?? null };
      }
      return mapProfile(await settingsApi.updateLocation(input), authUser?.username ?? '', interests);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKey(isDemo), profile);
      void queryClient.invalidateQueries({ queryKey: ['countries', 'profile'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
