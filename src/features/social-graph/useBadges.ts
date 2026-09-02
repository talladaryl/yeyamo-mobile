// Hook personnalisé pour la gestion des badges
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { badgesApi } from './badges.api';
import { MOCK_USER_STATS } from './mockData';
import { PREMIUM_BADGES } from './passport.badges';
import type { EntityId } from '@/types/api.types';

/**
 * Hook pour récupérer tous les badges de l'utilisateur
 */
export function useUserBadges() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['badges', isDemo ? 'demo' : 'backend', 'user'],
    queryFn: () =>
      isDemo ? Promise.resolve(PREMIUM_BADGES) : badgesApi.getUserBadges(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    // En développement, utiliser les mock data
    placeholderData: isDemo ? PREMIUM_BADGES : undefined,
  });
}

/**
 * Hook pour récupérer les détails d'un badge
 */
export function useBadgeDetails(badgeId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['badges', isDemo ? 'demo' : 'backend', badgeId],
    queryFn: () =>
      isDemo
        ? Promise.resolve(PREMIUM_BADGES.find((b) => String(b.id) === String(badgeId)) ?? PREMIUM_BADGES[0])
        : badgesApi.getBadgeDetails(badgeId),
    enabled: !!badgeId,
    staleTime: 1000 * 60 * 5,
    // En développement, utiliser les mock data
    placeholderData: isDemo ? PREMIUM_BADGES.find((b) => String(b.id) === String(badgeId)) : undefined,
  });
}

/**
 * Hook pour récupérer les statistiques des badges
 */
export function useUserBadgeStats() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['badges', isDemo ? 'demo' : 'backend', 'stats'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_USER_STATS) : badgesApi.getUserBadgeStats(),
    staleTime: 1000 * 60 * 5,
    // En développement, utiliser les mock data
    placeholderData: isDemo ? MOCK_USER_STATS : undefined,
  });
}

/**
 * Hook pour récupérer tous les badges disponibles
 */
export function useAllBadges() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['badges', isDemo ? 'demo' : 'backend', 'all'],
    queryFn: () =>
      isDemo ? Promise.resolve(PREMIUM_BADGES) : badgesApi.getAllBadges(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: isDemo ? PREMIUM_BADGES : undefined,
  });
}
