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
import { FEED_QUERY_KEY } from '@/features/feed/useFeed';
import { traceSocialRuntime } from './social.runtime-trace';
import type { ContentAuthorIdentity } from './social.api';

export const socialKeys = {
  all: ['social'] as const,
  muted: (mode: 'demo' | 'backend') => ['social', mode, 'muted'] as const,
  blocked: (mode: 'demo' | 'backend') => ['social', mode, 'blocked'] as const,
};

function useDemoMode() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

function useViewerKey() {
  return useAuthStore((state) => String(state.user?.id ?? 'anonymous'));
}

/** Canonical identity bridge used by Feed ownership/navigation decisions. */
export function useCurrentViewerContentIdentity() {
  const isDemo = useDemoMode();
  const viewerId = useViewerKey();
  return useQuery<ContentAuthorIdentity | null>({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'content-identity', viewerId],
    enabled: !isDemo && viewerId !== 'anonymous',
    queryFn: async () => (await socialApi.resolveContentAuthorIdentities([viewerId]))[0] ?? null,
    staleTime: 5 * 60_000,
  });
}

export function useSocialSuggestions() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'suggestions', viewerKey],
    queryFn: () => isDemo ? Promise.resolve(mockSuggestions) : socialApi.getSuggestions(),
    placeholderData: isDemo ? mockSuggestions : undefined,
  });
}

export function useFriendSuggestions() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'friend-suggestions', viewerKey],
    queryFn: () => isDemo ? Promise.resolve(mockSuggestions) : socialApi.getFriendSuggestions(),
    placeholderData: isDemo ? mockSuggestions : undefined,
  });
}

export function useFollowers() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'followers', viewerKey],
    queryFn: () => isDemo ? Promise.resolve(mockFollowers) : socialApi.getFollowers(),
    placeholderData: isDemo ? mockFollowers : undefined,
  });
}

export function useFollowing() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'following', viewerKey],
    queryFn: () => isDemo ? Promise.resolve(mockFollowing) : socialApi.getFollowing(),
    placeholderData: isDemo ? mockFollowing : undefined,
  });
}

export function useMutedUsers() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: [...socialKeys.muted(isDemo ? 'demo' : 'backend'), viewerKey],
    queryFn: () => isDemo ? Promise.resolve([]) : socialApi.getMutedUsers(),
  });
}

export function useBlockedUsers() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: [...socialKeys.blocked(isDemo ? 'demo' : 'backend'), viewerKey],
    queryFn: () => isDemo ? Promise.resolve([]) : socialApi.getBlockedUsers(),
  });
}

/** Mute and block are separate server-side relationships. Their state comes
 * from the two backend lists, never from a profile-card-local boolean. */
export function useSocialSafetyActions() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  const queryClient = useQueryClient();
  const reconcile = () => {
    queryClient.invalidateQueries({ queryKey: [...socialKeys.muted(isDemo ? 'demo' : 'backend'), viewerKey] });
    queryClient.invalidateQueries({ queryKey: [...socialKeys.blocked(isDemo ? 'demo' : 'backend'), viewerKey] });
    // Mute currently affects the personalized feed; block can also remove
    // social relationships. Reconcile only these targeted caches.
    queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['social', isDemo ? 'demo' : 'backend', 'following', viewerKey] });
    queryClient.invalidateQueries({ queryKey: ['social', isDemo ? 'demo' : 'backend', 'followers', viewerKey] });
  };
  const mute = useMutation({ mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.muteUser(userId), onSuccess: reconcile });
  const unmute = useMutation({ mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.unmuteUser(userId), onSuccess: reconcile });
  const block = useMutation({ mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.blockUser(userId), onSuccess: reconcile });
  const unblock = useMutation({ mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.unblockUser(userId), onSuccess: reconcile });
  return { mute, unmute, block, unblock };
}

export function useUserSearch(query: string) {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'search', query, viewerKey],
    queryFn: () => isDemo
      ? Promise.resolve(mockSearchResults.filter((item) =>
          `${item.display_name} ${item.username}`.toLowerCase().includes(query.toLowerCase()),
        ))
      : socialApi.searchUsers({ query }),
    enabled: isDemo || query.trim().length >= 2,
    placeholderData: isDemo ? mockSearchResults : undefined,
  });
}

export function useNetworkActivity() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'activity', viewerKey],
    queryFn: () => isDemo ? Promise.resolve(mockActivity) : socialApi.getNetworkActivity(),
    placeholderData: isDemo ? mockActivity : undefined,
  });
}

export function useSocialSettings() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  return useQuery({
    queryKey: ['social', isDemo ? 'demo' : 'backend', 'settings', viewerKey],
    queryFn: () => isDemo ? Promise.resolve(mockSettings) : socialApi.getSettings(),
    placeholderData: isDemo ? mockSettings : undefined,
  });
}

export function useUpdateSocialSettings() {
  const isDemo = useDemoMode();
  const viewerKey = useViewerKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<SocialSettings>) =>
      isDemo ? Promise.resolve({ ...mockSettings, ...settings }) : socialApi.updateSettings(settings),
    onMutate: async (patch) => {
      const key = ['social', isDemo ? 'demo' : 'backend', 'settings', viewerKey];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SocialSettings>(key);
      if (previous) queryClient.setQueryData<SocialSettings>(key, {
        privacy: { ...previous.privacy, ...patch.privacy },
        notifications: { ...previous.notifications, ...patch.notifications },
        preferences: { ...previous.preferences, ...patch.preferences },
      });
      return { key, previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
    },
    onSuccess: (settings, _patch, context) => {
      queryClient.setQueryData(context?.key ?? ['social', isDemo ? 'demo' : 'backend', 'settings', viewerKey], settings);
    },
  });
}

export function useFollowActions() {
  const isDemo = useDemoMode();
  const queryClient = useQueryClient();
  const viewerId = useAuthStore((state) => state.user?.id ?? null);
  const refresh = async () => {
    traceSocialRuntime('FOLLOW_QUERY_INVALIDATE', { flow: 'follow', viewerUserId: viewerId });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['social'] }),
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY, refetchType: 'active' }),
    ]);
  };
  const optimisticFollow = async (userId: EntityId, isFollowing: boolean) => {
    await queryClient.cancelQueries({ queryKey: ['social'] });
    const previous = queryClient.getQueriesData({ queryKey: ['social'] });
    queryClient.setQueriesData({ queryKey: ['social'] }, (value: unknown) => {
      if (!Array.isArray(value)) return value;
      return value.map((item) => item && typeof item === 'object' && String((item as { id?: EntityId }).id) === String(userId)
        ? { ...item, is_following: isFollowing }
        : item);
    });
    return { previous };
  };
  const follow = useMutation({
    mutationFn: (userId: EntityId) => {
      traceSocialRuntime('FOLLOW_REQUEST', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), beforeIsFollowing: false });
      return isDemo ? Promise.resolve() : socialApi.followUser(userId);
    },
    onMutate: async (userId) => {
      const context = await optimisticFollow(userId, true);
      traceSocialRuntime('FOLLOW_LOCAL_APPLY', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), afterIsFollowing: true });
      return context;
    },
    onError: (_error, userId, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
      traceSocialRuntime('FOLLOW_ROLLBACK', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId) });
    },
    onSuccess: async (_result, userId) => {
      traceSocialRuntime('FOLLOW_RESPONSE', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), status: 204 });
      await refresh();
      traceSocialRuntime('FOLLOW_PROFILE_REFETCH', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), afterIsFollowing: true });
      traceSocialRuntime('FOLLOW_REFETCH_RESULT', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), receivedState: true });
    },
  });
  const unfollow = useMutation({
    mutationFn: (userId: EntityId) => {
      traceSocialRuntime('UNFOLLOW_REQUEST', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), beforeIsFollowing: true });
      return isDemo ? Promise.resolve() : socialApi.unfollowUser(userId);
    },
    onMutate: async (userId) => {
      const context = await optimisticFollow(userId, false);
      traceSocialRuntime('FOLLOW_LOCAL_APPLY', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), afterIsFollowing: false });
      return context;
    },
    onError: (_error, userId, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
      traceSocialRuntime('UNFOLLOW_ROLLBACK', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId) });
    },
    onSuccess: async (_result, userId) => {
      traceSocialRuntime('UNFOLLOW_RESPONSE', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), status: 204 });
      await refresh();
      traceSocialRuntime('FOLLOW_PROFILE_REFETCH', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), afterIsFollowing: false });
      traceSocialRuntime('UNFOLLOW_REFETCH_RESULT', { flow: 'follow', viewerUserId: viewerId, targetUserId: String(userId), receivedState: false });
    },
  });
  const removeFollower = useMutation({
    mutationFn: (userId: EntityId) => isDemo ? Promise.resolve() : socialApi.removeFollower(userId),
    onSuccess: refresh,
  });
  return { follow, unfollow, removeFollower };
}
