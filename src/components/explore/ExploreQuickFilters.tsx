import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { DiscoveryType } from '@/features/discovery/discovery.types';
import { i18n } from '@/i18n';

type QuickFilter = {
  key: string;
  label: string;
  type?: DiscoveryType;
  nearby?: boolean;
};

const QUICK_FILTERS: QuickFilter[] = [
  { key: 'all', label: 'all' },
  { key: 'nearby', label: 'nearby', nearby: true },
  { key: 'places', label: 'places', type: 'PLACE' },
  { key: 'events', label: 'events', type: 'EVENT' },
  { key: 'culture', label: 'culture', type: 'CULTURE' },
  { key: 'artworks', label: 'artworks', type: 'ARTWORK' },
  { key: 'artisans', label: 'artisans', type: 'ARTISAN' },
];

type ExploreQuickFiltersProps = {
  selectedType?: DiscoveryType;
  nearby: boolean;
  activeFilterCount: number;
  onSelect: (filter: { type?: DiscoveryType; nearby: boolean }) => void;
  onOpenAdvanced: () => void;
};

export function ExploreQuickFilters({ selectedType, nearby, activeFilterCount, onSelect, onOpenAdvanced }: ExploreQuickFiltersProps) {
  const colors = useThemeStore((state) => state.colors);
  const activeKey = nearby ? 'nearby' : QUICK_FILTERS.find((item) => item.type === selectedType)?.key ?? 'all';

  return (
    <View className="mb-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {QUICK_FILTERS.map((filter) => {
          const active = filter.key === activeKey;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => onSelect({ type: filter.type, nearby: Boolean(filter.nearby) })}
              className="h-9 flex-row items-center rounded-xl border px-3"
              style={{ backgroundColor: active ? `${colors.primary}14` : 'transparent', borderColor: active ? colors.primary : colors.border }}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={i18n.t(`explore.quickFilters.${filter.label}`)}
            >
              <Text className="text-xs font-semibold" style={{ color: active ? colors.primary : colors.textSecondary }}>{i18n.t(`explore.quickFilters.${filter.label}`)}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={onOpenAdvanced}
          className="h-9 flex-row items-center rounded-xl border px-3"
          style={{ backgroundColor: colors.elevated, borderColor: colors.border }}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('explore.advanced.title')}
        >
          <Icon name="options-outline" size={15} color={colors.textSecondary} />
          <Text className="ml-1.5 text-xs font-semibold" style={{ color: colors.text }}>{i18n.t('explore.quickFilters.filters')}</Text>
          {activeFilterCount > 0 ? <View className="ml-1.5 h-4 min-w-4 items-center justify-center rounded-full px-1" style={{ backgroundColor: colors.primary }}><Text className="text-[9px] font-bold text-white">{activeFilterCount}</Text></View> : null}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
