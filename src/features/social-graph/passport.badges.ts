import { MOCK_BADGES } from './mockData';
import type { Badge, BadgeCategory, BadgeLevel, BadgeRarity } from './types';

const enrichments: Array<{ category: BadgeCategory; rarity: BadgeRarity; condition: string; icon: string }> = [
  { category: 'exploration', rarity: 'epic', condition: 'Découvrir 25 lieux différents', icon: 'compass' },
  { category: 'photography', rarity: 'rare', condition: 'Publier 10 expériences avec photo', icon: 'camera' },
  { category: 'community', rarity: 'common', condition: 'Publier 5 avis utiles', icon: 'people' },
  { category: 'culture', rarity: 'legendary', condition: 'Aider 50 voyageurs de la communauté', icon: 'library' },
];

function levels(color: string, unlocked: boolean): BadgeLevel[] {
  return [
    { level: 1, name: 'Découverte', xp_required: 0, icon_color: color, is_unlocked: unlocked },
    { level: 2, name: 'Passionné', xp_required: 750, icon_color: color, is_unlocked: false },
    { level: 3, name: 'Expert', xp_required: 2000, icon_color: color, is_unlocked: false, reward: 'Titre exclusif + 250 XP' },
  ];
}

function badge(id: number, name: string, description: string, category: BadgeCategory, rarity: BadgeRarity, condition: string, icon: string, progress: number, target: number, unlocked: boolean, color: string): Badge {
  return { id, name, slug: name.toLowerCase().replace(/\s+/g, '-'), description, icon_url: '', icon, category, rarity, condition, current_level: unlocked ? 1 : 0, max_level: 3, current_xp: progress, next_level_xp: target, total_xp: progress, is_unlocked: unlocked, unlocked_at: unlocked ? '2026-06-12T10:00:00Z' : undefined, levels: levels(color, unlocked) };
}

export const PREMIUM_BADGES: Badge[] = [
  ...MOCK_BADGES.map((item, index) => ({ ...item, ...enrichments[index] })),
  badge(5, 'Saveurs du Cameroun', 'Goûtez les spécialités qui font vivre chaque région.', 'gastronomy', 'rare', 'Découvrir 10 restaurants locaux', 'restaurant', 10, 10, true, '#F59E0B'),
  badge(6, 'Gardien de la nature', 'Explorez les parcs, montagnes et réserves naturelles.', 'nature', 'epic', 'Visiter 8 espaces naturels', 'leaf', 5, 8, false, '#16A34A'),
  badge(7, 'Toujours de la fête', 'Participez aux événements qui rythment le pays.', 'events', 'rare', 'Participer à 10 événements', 'calendar', 6, 10, false, '#F97316'),
  badge(8, 'Grand Voyageur', 'Traversez les régions et multipliez les escapades.', 'travel', 'legendary', 'Visiter les 10 régions du Cameroun', 'airplane', 4, 10, false, '#2563EB'),
  badge(9, 'Partenaire de confiance', 'Valorisez une activité professionnelle de qualité.', 'partner', 'epic', 'Recevoir 25 avis cinq étoiles', 'briefcase', 12, 25, false, '#8B5CF6'),
  badge(10, 'Été à Kribi', 'Une récompense disponible pendant la saison estivale.', 'seasonal', 'rare', 'Faire 3 check-ins à Kribi cet été', 'sunny', 1, 3, false, '#EC4899'),
];
