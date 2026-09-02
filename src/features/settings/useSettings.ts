import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { useInterestsStore } from '@/features/interests/interests.store';
import { MOCK_USER_SETTINGS } from './mockData';
import { settingsApi, type UpdateBackendProfile } from './settings.api';
import type { ProfileSettings } from './types';

function useDemoMode() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function useProfileSettings() {
  const isDemo = useDemoMode();
  const authUser = useAuthStore((state) => state.user);
  const interests = useInterestsStore((state) => state.selectedInterestIds);
  return useQuery({
    queryKey: ['settings', isDemo ? 'demo' : 'backend', 'profile'],
    queryFn: async (): Promise<ProfileSettings> => {
      if (isDemo) return MOCK_USER_SETTINGS.profile;
      const profile = await settingsApi.getProfile();
      return {
        avatar_url: profile.avatarUrl,
        display_name: profile.displayName,
        username: authUser?.username ?? '',
        bio: profile.bio,
        city: null,
        region: profile.preferredRegionId == null ? null : String(profile.preferredRegionId),
        gender: null,
        interests,
      };
    },
    placeholderData: isDemo ? MOCK_USER_SETTINGS.profile : undefined,
  });
}

export function useUpdateProfileSettings() {
  const isDemo = useDemoMode();
  const queryClient = useQueryClient();
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
      await settingsApi.updateProfile(input);
      return profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['settings', isDemo ? 'demo' : 'backend', 'profile'], profile);
    },
  });
}
