// Hook personnalisé pour la gestion des badges
import { useQuery } from '@tanstack/react-query';
import { badgesApi } from './badges.api';
import { MOCK_BADGES, MOCK_USER_STATS } from './mockData';

/**
 * Hook pour récupérer tous les badges de l'utilisateur
 */
export function useUserBadges() {
  return useQuery({
    queryKey: ['badges', 'user'],
    queryFn: badgesApi.getUserBadges,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // En développement, utiliser les mock data
    placeholderData: MOCK_BADGES,
  });
}

/**
 * Hook pour récupérer les détails d'un badge
 */
export function useBadgeDetails(badgeId: number) {
  return useQuery({
    queryKey: ['badges', badgeId],
    queryFn: () => badgesApi.getBadgeDetails(badgeId),
    enabled: !!badgeId,
    staleTime: 1000 * 60 * 5,
    // En développement, utiliser les mock data
    placeholderData: MOCK_BADGES.find((b) => b.id === badgeId),
  });
}

/**
 * Hook pour récupérer les statistiques des badges
 */
export function useUserBadgeStats() {
  return useQuery({
    queryKey: ['badges', 'stats'],
    queryFn: badgesApi.getUserBadgeStats,
    staleTime: 1000 * 60 * 5,
    // En développement, utiliser les mock data
    placeholderData: MOCK_USER_STATS,
  });
}

/**
 * Hook pour récupérer tous les badges disponibles
 */
export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'all'],
    queryFn: badgesApi.getAllBadges,
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: MOCK_BADGES,
  });
}
