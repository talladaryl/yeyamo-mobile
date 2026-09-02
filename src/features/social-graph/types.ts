// Types pour le système de badges et graphe social

export type BadgeCategory = 'exploration' | 'culture' | 'gastronomy' | 'nature' | 'events' | 'community' | 'photography' | 'travel' | 'partner' | 'seasonal' | 'creation' | 'social' | 'contribution';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: EntityId;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  category: BadgeCategory;
  rarity?: BadgeRarity;
  condition?: string;
  icon?: string;
  current_level: number;
  max_level: number;
  current_xp: number;
  next_level_xp: number;
  total_xp: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  levels: BadgeLevel[];
}

export interface BadgeLevel {
  level: number;
  name: string;
  xp_required: number;
  reward?: string;
  icon_color: string;
  is_unlocked: boolean;
}

export interface XPAction {
  id: number;
  action: string;
  xp_reward: number;
  icon: string;
  description: string;
}

export interface UserBadgeStats {
  total_badges: number;
  unlocked_badges: number;
  total_xp: number;
  level: number;
  rank: string;
}

export interface BadgeSummary {
  id: number;
  name: string;
  slug: string;
  icon_url: string;
  current_level: number;
  max_level: number;
  progress_percentage: number;
  is_unlocked: boolean;
}
import type { EntityId } from '@/types/api.types';
