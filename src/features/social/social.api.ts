// API endpoints pour le Social Graph
import { apiClient } from '@/services/api/client';
import type {
  UserSearchResult,
  FollowUser,
  SuggestionUser,
  ActivityItem,
  SearchFilters,
  SocialSettings,
} from './types';

export const socialApi = {
  // Recherche d'utilisateurs
  searchUsers: async (filters: SearchFilters) => {
    const { data } = await apiClient.get<{ data: UserSearchResult[] }>('/social/search', {
      params: filters,
    });
    return data.data;
  },

  // Liste des abonnements (following)
  getFollowing: async (userId?: number) => {
    const endpoint = userId ? `/social/users/${userId}/following` : '/social/following';
    const { data } = await apiClient.get<{ data: FollowUser[] }>(endpoint);
    return data.data;
  },

  // Liste des abonnés (followers)
  getFollowers: async (userId?: number) => {
    const endpoint = userId ? `/social/users/${userId}/followers` : '/social/followers';
    const { data } = await apiClient.get<{ data: FollowUser[] }>(endpoint);
    return data.data;
  },

  // Suggestions de personnes à suivre
  getSuggestions: async () => {
    const { data } = await apiClient.get<{ data: SuggestionUser[] }>('/social/suggestions');
    return data.data;
  },

  // Suggestions d'amis (basées sur contacts)
  getFriendSuggestions: async () => {
    const { data } = await apiClient.get<{ data: SuggestionUser[] }>('/social/friend-suggestions');
    return data.data;
  },

  // Activité du réseau
  getNetworkActivity: async () => {
    const { data } = await apiClient.get<{ data: ActivityItem[] }>('/social/activity');
    return data.data;
  },

  // Suivre un utilisateur
  followUser: async (userId: number) => {
    await apiClient.post(`/social/users/${userId}/follow`);
  },

  // Ne plus suivre un utilisateur
  unfollowUser: async (userId: number) => {
    await apiClient.delete(`/social/users/${userId}/follow`);
  },

  // Retirer un abonné
  removeFollower: async (userId: number) => {
    await apiClient.delete(`/social/followers/${userId}`);
  },

  // Récupérer les paramètres sociaux
  getSettings: async () => {
    const { data } = await apiClient.get<SocialSettings>('/social/settings');
    return data;
  },

  // Mettre à jour les paramètres
  updateSettings: async (settings: Partial<SocialSettings>) => {
    const { data } = await apiClient.put<SocialSettings>('/social/settings', settings);
    return data;
  },
};
