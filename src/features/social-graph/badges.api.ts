import { apiClient } from '@/services/api/client';
import type { EntityId } from '@/types/api.types';
import type { Badge, UserBadgeStats } from './types';

interface BackendBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  earnedAt: string;
}

function mapBadge(badge: BackendBadge): Badge {
  return {
    id: badge.id,
    name: badge.name,
    slug: badge.code.toLowerCase(),
    description: badge.description,
    icon_url: '',
    icon: 'trophy',
    category: 'community',
    rarity: 'common',
    condition: badge.description,
    current_level: 1,
    max_level: 1,
    current_xp: 1,
    next_level_xp: 1,
    total_xp: 1,
    is_unlocked: true,
    unlocked_at: badge.earnedAt,
    levels: [{
      level: 1,
      name: badge.name,
      xp_required: 1,
      icon_color: '#F59E0B',
      is_unlocked: true,
    }],
  };
}

async function badges(): Promise<Badge[]> {
  const { data } = await apiClient.get<BackendBadge[]>('/me/badges');
  return data.map(mapBadge);
}

export const badgesApi = {
  getUserBadges: badges,

  getBadgeDetails: async (badgeId: EntityId): Promise<Badge> => {
    const result = await badges();
    const badge = result.find((item) => String(item.id) === String(badgeId));
    if (!badge) throw new Error('Badge introuvable pour cet utilisateur');
    return badge;
  },

  getUserBadgeStats: async (): Promise<UserBadgeStats> => {
    const [result, progress] = await Promise.all([
      badges(),
      apiClient.get<{ totalXp: number; level: number }>('/me/xp').then(({ data }) => data),
    ]);
    return {
      total_badges: result.length,
      unlocked_badges: result.length,
      total_xp: progress.totalXp,
      level: progress.level,
      rank: 'Non classé',
    };
  },

  getAllBadges: badges,
};
