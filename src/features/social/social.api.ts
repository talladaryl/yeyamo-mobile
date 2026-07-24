import { apiClient } from '@/services/api/client';
import { fallbackUser, fromSpringPage, type SpringPage } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type {
  ActivityItem,
  FollowUser,
  SearchFilters,
  SocialSettings,
  SuggestionUser,
  UserSearchResult,
} from './types';

interface BackendProfileSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

interface BackendActivity {
  follower: BackendProfileSummary;
  followee: BackendProfileSummary;
  timestamp: string;
  activityType: string;
}

interface BackendSocialSettings {
  privacy: {
    profileVisibility: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
    showActivity: boolean;
    showFollowers: boolean;
    showFollowing: boolean;
  };
  notifications: {
    newFollowers: boolean;
    followRequests: boolean;
    mentions: boolean;
    activityUpdates: boolean;
  };
  preferences: {
    allowSuggestions: boolean;
    allowMessagesFromStrangers: boolean;
  };
}

function mapFollowUser(profile: BackendProfileSummary): FollowUser {
  return {
    ...fallbackUser(profile.id, profile.displayName),
    avatar_url: profile.avatarUrl,
    bio: profile.bio ?? undefined,
    followers_count: profile.followersCount,
    is_following: profile.isFollowing,
    is_followed_by: false,
  };
}

function mapSuggestion(profile: BackendProfileSummary): SuggestionUser {
  return {
    ...mapFollowUser(profile),
    mutual_friends_count: 0,
    reason: 'Suggestion Yeyamo',
  };
}

function mapSettings(settings: BackendSocialSettings): SocialSettings {
  return {
    privacy: {
      profile_visibility:
        settings.privacy.profileVisibility === 'FOLLOWERS_ONLY'
          ? 'followers'
          : settings.privacy.profileVisibility.toLowerCase() as 'public' | 'private',
      show_activity: settings.privacy.showActivity,
      show_followers: settings.privacy.showFollowers,
      show_following: settings.privacy.showFollowing,
    },
    notifications: {
      new_followers: settings.notifications.newFollowers,
      follow_requests: settings.notifications.followRequests,
      mentions: settings.notifications.mentions,
      activity_updates: settings.notifications.activityUpdates,
    },
    preferences: {
      allow_suggestions: settings.preferences.allowSuggestions,
      allow_messages_from_strangers: settings.preferences.allowMessagesFromStrangers,
    },
  };
}

export const socialApi = {
  searchUsers: async (filters: SearchFilters): Promise<UserSearchResult[]> => {
    const { data } = await apiClient.get<SpringPage<BackendProfileSummary>>(
      '/users/social/search',
      { params: { query: filters.query ?? '', page: 0, size: 20 } },
    );
    return fromSpringPage(data).data.map((profile) => ({
      ...mapFollowUser(profile),
      mutual_friends_count: 0,
    }));
  },

  getFollowing: async (userId?: EntityId): Promise<FollowUser[]> => {
    const endpoint = userId
      ? `/users/social/${userId}/following`
      : '/users/social/following';
    const { data } = await apiClient.get<SpringPage<BackendProfileSummary>>(endpoint);
    return fromSpringPage(data).data.map(mapFollowUser);
  },

  getFollowers: async (userId?: EntityId): Promise<FollowUser[]> => {
    const endpoint = userId
      ? `/users/social/${userId}/followers`
      : '/users/social/followers';
    const { data } = await apiClient.get<SpringPage<BackendProfileSummary>>(endpoint);
    return fromSpringPage(data).data.map(mapFollowUser);
  },

  getSuggestions: async (): Promise<SuggestionUser[]> => {
    const { data } = await apiClient.get<BackendProfileSummary[]>('/users/social/suggestions');
    return data.map(mapSuggestion);
  },

  getFriendSuggestions: async (): Promise<SuggestionUser[]> =>
    socialApi.getSuggestions(),

  getNetworkActivity: async (): Promise<ActivityItem[]> => {
    const { data } = await apiClient.get<BackendActivity[]>('/users/social/activity');
    return data.map((activity, index) => ({
      id: `${activity.timestamp}-${index}`,
      type: 'follow',
      user: mapFollowUser(activity.follower),
      target_user: mapFollowUser(activity.followee),
      created_at: activity.timestamp,
    }));
  },

  followUser: async (userId: EntityId): Promise<void> => {
    await apiClient.post(`/users/social/${userId}/follow`);
  },

  unfollowUser: async (userId: EntityId): Promise<void> => {
    await apiClient.delete(`/users/social/${userId}/follow`);
  },

  removeFollower: async (userId: EntityId): Promise<void> => {
    await apiClient.delete(`/users/social/followers/${userId}`);
  },

  getSettings: async (): Promise<SocialSettings> => {
    const { data } = await apiClient.get<BackendSocialSettings>('/users/social/settings');
    return mapSettings(data);
  },

  updateSettings: async (settings: Partial<SocialSettings>): Promise<SocialSettings> => {
    const { data } = await apiClient.put<BackendSocialSettings>('/users/social/settings', {
      privacy: settings.privacy
        ? {
            profileVisibility:
              settings.privacy.profile_visibility === 'followers'
                ? 'FOLLOWERS_ONLY'
                : settings.privacy.profile_visibility.toUpperCase(),
            showActivity: settings.privacy.show_activity,
            showFollowers: settings.privacy.show_followers,
            showFollowing: settings.privacy.show_following,
          }
        : undefined,
      notifications: settings.notifications
        ? {
            newFollowers: settings.notifications.new_followers,
            followRequests: settings.notifications.follow_requests,
            mentions: settings.notifications.mentions,
            activityUpdates: settings.notifications.activity_updates,
          }
        : undefined,
      preferences: settings.preferences
        ? {
            allowSuggestions: settings.preferences.allow_suggestions,
            allowMessagesFromStrangers:
              settings.preferences.allow_messages_from_strangers,
          }
        : undefined,
    });
    return mapSettings(data);
  },
};
