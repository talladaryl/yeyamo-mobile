import { useQuery } from '@tanstack/react-query';
import { badgesApi } from './badges.api';
import type { EntityId } from '@/types/api.types';

/** User badge data is always sourced from the authenticated backend contract. */
export function useUserBadges() {
  return useQuery({
    queryKey: ['badges', 'backend', 'user'],
    queryFn: badgesApi.getUserBadges,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBadgeDetails(badgeId: EntityId) {
  return useQuery({
    queryKey: ['badges', 'backend', badgeId],
    queryFn: () => badgesApi.getBadgeDetails(badgeId),
    enabled: !!badgeId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserBadgeStats() {
  return useQuery({
    queryKey: ['badges', 'backend', 'stats'],
    queryFn: badgesApi.getUserBadgeStats,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ['badges', 'backend', 'all'],
    queryFn: badgesApi.getAllBadges,
    staleTime: 1000 * 60 * 10,
  });
}
