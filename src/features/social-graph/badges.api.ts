// API endpoints pour les badges
import { apiClient } from '@/services/api/client';
import type { Badge, UserBadgeStats } from './types';

export const badgesApi = {
  /**
   * Récupère tous les badges de l'utilisateur
   */
  getUserBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get<{ data: Badge[] }>('/badges/user');
    return response.data.data;
  },

  /**
   * Récupère les détails d'un badge spécifique
   */
  getBadgeDetails: async (badgeId: number): Promise<Badge> => {
    const response = await apiClient.get<{ data: Badge }>(`/badges/${badgeId}`);
    return response.data.data;
  },

  /**
   * Récupère les statistiques globales des badges de l'utilisateur
   */
  getUserBadgeStats: async (): Promise<UserBadgeStats> => {
    const response = await apiClient.get<{ data: UserBadgeStats }>('/badges/stats');
    return response.data.data;
  },

  /**
   * Récupère tous les badges disponibles dans l'app
   */
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get<{ data: Badge[] }>('/badges');
    return response.data.data;
  },
};
