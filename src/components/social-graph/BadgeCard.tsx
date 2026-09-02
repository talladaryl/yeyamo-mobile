import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import type { Badge, BadgeRarity } from '@/features/social-graph/types';
import { useThemeStore } from '@/features/theme/theme.store';

const RARITY: Record<BadgeRarity, { label: string; color: string }> = {
  common: { label: 'Commun', color: '#64748B' }, rare: { label: 'Rare', color: '#2563EB' }, epic: { label: 'Épique', color: '#8B5CF6' }, legendary: { label: 'Légendaire', color: '#F59E0B' },
};

export function BadgeCard({ badge, onPress }: { badge: Badge; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const rarity = RARITY[badge.rarity ?? 'common'];
  const progress = badge.next_level_xp > 0 ? Math.min((badge.current_xp / badge.next_level_xp) * 100, 100) : 100;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-3 overflow-hidden rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: badge.is_unlocked ? `${rarity.color}55` : colors.border }}>
      <View className="flex-row">
        <View className="h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: badge.is_unlocked ? `${rarity.color}18` : colors.elevated }}><Icon name={badge.is_unlocked ? (badge.icon ?? 'trophy') : 'lock-closed'} size={31} color={badge.is_unlocked ? rarity.color : colors.textMuted} /></View>
        <View className="ml-3 flex-1"><View className="flex-row items-start justify-between"><Text className="flex-1 text-base font-extrabold" style={{ color: badge.is_unlocked ? colors.text : colors.textSecondary }}>{badge.name}</Text><View className="ml-2 rounded-full px-2 py-1" style={{ backgroundColor: `${rarity.color}16` }}><Text className="text-[9px] font-extrabold uppercase" style={{ color: rarity.color }}>{rarity.label}</Text></View></View><Text className="mt-1 text-xs capitalize" style={{ color: colors.textSecondary }}>{categoryLabel(badge.category)} · {badge.is_unlocked ? `Niveau ${badge.current_level}` : 'Verrouillé'}</Text><Text className="mt-2 text-xs leading-5" style={{ color: colors.textSecondary }} numberOfLines={2}>{badge.description}</Text></View>
      </View>
      <View className="mt-4"><AnimatedProgressBar value={progress} color={rarity.color} height={7} /><View className="mt-2 flex-row justify-between"><Text className="flex-1 text-[10px]" style={{ color: colors.textMuted }} numberOfLines={1}>{badge.condition ?? 'Continuez à explorer pour le débloquer'}</Text><Text className="ml-2 text-[10px] font-bold" style={{ color: colors.textSecondary }}>{Math.round(progress)}%</Text></View></View>
      {badge.unlocked_at ? <Text className="mt-2 text-[10px] font-semibold text-[#16A34A]">Obtenu le {new Intl.DateTimeFormat('fr-FR').format(new Date(badge.unlocked_at))}</Text> : null}
    </TouchableOpacity>
  );
}

export function categoryLabel(value: Badge['category']) { return ({ exploration: 'Exploration', culture: 'Culture', gastronomy: 'Gastronomie', nature: 'Nature', events: 'Événements', community: 'Communauté', photography: 'Photographie', travel: 'Voyage', partner: 'Partenaire', seasonal: 'Saisonnier', creation: 'Création', social: 'Communauté', contribution: 'Communauté' } as Record<Badge['category'], string>)[value]; }
