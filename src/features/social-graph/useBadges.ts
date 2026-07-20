// Hook personnalisé pour la gestion des badges
import { useQuery } from '@tanstack/react-query';
import ENV from '@/config/env';
import { badgesApi } from './badges.api';
import { MOCK_USER_STATS } from './mockData';
import { PREMIUM_BADGES } from './passport.badges';

/**
 * Hook pour récupérer tous les badges de l'utilisateur
 */
export function useUserBadges() {
  return useQuery({
    queryKey: ['badges', 'user'],
    queryFn: () =>
      ENV.USE_MOCKS ? Promise.resolve(PREMIUM_BADGES) : badgesApi.getUserBadges(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    // En développement, utiliser les mock data
    placeholderData: PREMIUM_BADGES,
  });
}

/**
 * Hook pour récupérer les détails d'un badge
 */
export function useBadgeDetails(badgeId: number) {
  return useQuery({
    queryKey: ['badges', badgeId],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve(PREMIUM_BADGES.find((b) => b.id === badgeId) ?? PREMIUM_BADGES[0])
        : badgesApi.getBadgeDetails(badgeId),
    enabled: !!badgeId,
    staleTime: 1000 * 60 * 5,
    // En développement, utiliser les mock data
    placeholderData: PREMIUM_BADGES.find((b) => b.id === badgeId),
  });
}

/**
 * Hook pour récupérer les statistiques des badges
 */
export function useUserBadgeStats() {
  return useQuery({
    queryKey: ['badges', 'stats'],
    queryFn: () =>
      ENV.USE_MOCKS ? Promise.resolve(MOCK_USER_STATS) : badgesApi.getUserBadgeStats(),
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
    queryFn: () =>
      ENV.USE_MOCKS ? Promise.resolve(PREMIUM_BADGES) : badgesApi.getAllBadges(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: PREMIUM_BADGES,
  });
}
