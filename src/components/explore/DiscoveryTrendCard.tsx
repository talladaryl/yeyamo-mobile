import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { DiscoveryItem } from '@/features/discovery/discovery.types';
import { i18n } from '@/i18n';

const TYPE_META: Record<DiscoveryItem['type'], { labelKey: string; icon: string; color: string }> = {
  DESTINATION: { labelKey: 'destination', icon: 'map-outline', color: '#0EA5E9' },
  PLACE: { labelKey: 'nearby', icon: 'location-outline', color: '#EF4444' },
  EXPERIENCE: { labelKey: 'experience', icon: 'compass-outline', color: '#10B981' },
  EVENT: { labelKey: 'event', icon: 'calendar-outline', color: '#8B5CF6' },
  CONTENT: { labelKey: 'content', icon: 'sparkles-outline', color: '#F59E0B' },
  ARTWORK: { labelKey: 'artwork', icon: 'color-palette-outline', color: '#B45309' },
  ARTISAN: { labelKey: 'artisan', icon: 'people-outline', color: '#DB2777' },
  CULTURE: { labelKey: 'culture', icon: 'leaf-outline', color: '#16A34A' },
  LANGUAGE: { labelKey: 'language', icon: 'language-outline', color: '#2563EB' },
  TRADITION: { labelKey: 'tradition', icon: 'sparkles-outline', color: '#9333EA' },
};

export function DiscoveryTrendCard({ item, onPress, onInterested, onNotInterested, feedbackDisabled = false }: { item: DiscoveryItem; onPress: () => void; onInterested?: () => void; onNotInterested?: () => void; feedbackDisabled?: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  const meta = TYPE_META[item.type];
  const location = [item.city, item.regionCode, item.countryCode].filter(Boolean).join(' · ');

  return (
    <View className="mr-3 w-60 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.84} accessibilityRole="button" accessibilityLabel={`${i18n.t('explore.discoverResult')} ${item.title}`}>
      <View className="flex-row items-center justify-between">
        <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}18` }}>
          <Icon name={meta.icon} size={23} color={meta.color} />
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${meta.color}18` }}>
          <Text className="text-[11px] font-bold" style={{ color: meta.color }}>{i18n.t(`explore.trendTypes.${meta.labelKey}`)}</Text>
        </View>
      </View>
      <Text className="mt-4 text-base font-extrabold" style={{ color: colors.text }} numberOfLines={2}>{item.title}</Text>
      {item.description ? <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }} numberOfLines={2}>{item.description}</Text> : null}
        <Text className="mt-4 text-xs font-semibold" style={{ color: colors.textMuted }} numberOfLines={1}>{location || i18n.t('explore.community')}</Text>
      </TouchableOpacity>
      {onInterested && onNotInterested ? <View className="mt-3 flex-row border-t pt-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onInterested} disabled={feedbackDisabled} className="mr-3 min-h-10 flex-1 justify-center" accessibilityRole="button" accessibilityLabel={`Intéressé par ${item.title}`}><Text className="text-center text-xs font-bold" style={{ color: feedbackDisabled ? colors.textMuted : colors.primary }}>Intéressé</Text></TouchableOpacity><TouchableOpacity onPress={onNotInterested} disabled={feedbackDisabled} className="min-h-10 flex-1 justify-center" accessibilityRole="button" accessibilityLabel={`Pas intéressé par ${item.title}`}><Text className="text-center text-xs font-bold" style={{ color: feedbackDisabled ? colors.textMuted : colors.textSecondary }}>Pas intéressé</Text></TouchableOpacity></View> : null}
    </View>
  );
}
