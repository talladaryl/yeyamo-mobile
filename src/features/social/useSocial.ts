import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import type { EntityId } from '@/types/api.types';
import {
  mockActivity,
  mockFollowers,
  mockFollowing,
  mockSearchResults,
  mockSettings,
  mockSuggestions,
} from './mockData';
import { socialApi } from './social.api';
import type { SocialSettings } from './types';

function useDemoMode() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function useSocialSuggestions() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'suggestions'],
    queryFn: () => isDemo ? Promise.resolve(mockSuggestions) : socialApi.getSuggestions(),
    placeholderData: isDemo ? mockSuggestions : undefined,
  });
}

export function useFriendSuggestions() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'friend-suggestions'],
    queryFn: () => isDemo ? Promise.resolve(mockSuggestions) : socialApi.getFriendSuggestions(),
    placeholderData: isDemo ? mockSuggestions : undefined,
  });
}

export function useFollowers() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'followers'],
    queryFn: () => isDemo ? Promise.resolve(mockFollowers) : socialApi.getFollowers(),
    placeholderData: isDemo ? mockFollowers : undefined,
  });
}

export function useFollowing() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'following'],
    queryFn: () => isDemo ? Promise.resolve(mockFollowing) : socialApi.getFollowing(),
    placeholderData: isDemo ? mockFollowing : undefined,
  });
}

export function useUserSearch(query: string) {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'search', query],
    queryFn: () => isDemo
      ? Promise.resolve(mockSearchResults.filter((item) =>
          `${item.display_name} ${item.username}`.toLowerCase().includes(query.toLowerCase()),
        ))
      : socialApi.searchUsers({ query }),
    enabled: isDemo || query.trim().length > 0,
    placeholderData: isDemo ? mockSearchResults : undefined,
  });
}

export function useNetworkActivity() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'activity'],
    queryFn: () => isDemo ? Promise.resolve(mockActivity) : socialApi.getNetworkActivity(),
    placeholderData: isDemo ? mockActivity : undefined,
  });
}

export function useSocialSettings() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'settings'],
    queryFn: () => isDemo ? Promise.resolve(mockSettings) : socialApi.getSettings(),
    placeholderData: isDemo ? mockSettings : undefined,
  });
}

export function useUpdateSocialSettings() {
  const isDemo = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<SocialSettings>) =>
      isDemo ? Promise.resolve({ ...mockSettings, ...settings }) : socialApi.updateSettings(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        ['social', isDemo ? 'demo' : 'backend', 'settings'],
        settings,
      );
    },
  });
}

export function useFollowActions() {
  const isDemo = useDemoMode();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['social'] });
  const follow = useMutation({
    mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.followUser(userId),
    onSuccess: refresh,
  });
  const unfollow = useMutation({
    mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.unfollowUser(userId),
    onSuccess: refresh,
  });
  const removeFollower = useMutation({
    mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.removeFollower(userId),
    onSuccess: refresh,
  });
  return { follow, unfollow, removeFollower };
}
